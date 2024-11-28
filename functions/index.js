const fs = require('fs');
const uuid = require('uuid');
const cors = require('cors')({origin: true});
const vision = require('@google-cloud/vision');
const {Datastore} = require('@google-cloud/datastore');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
const {google} = require('googleapis');
const validation = require('./validation');

ffmpeg.setFfmpegPath(ffmpegPath);
const visionClient = new vision.v1p3beta1.ImageAnnotatorClient();
const datastore = new Datastore({
    databaseId: 'woolaroo' 
});

async function getGoogleAPIAuthentication() {
    const auth = new google.auth.GoogleAuth({ scopes: ['https://www.googleapis.com/auth/drive'] });
    return await auth.getClient();
}

// Makes an ffmpeg command return a promise.
function promisifyCommand(command) {
    return new Promise((resolve, reject) => {
        command.on('end', resolve).on('error', reject).run();
    });
}

async function writeFileAsync(path, buffer) {
    return new Promise((resolve, reject) => {
        fs.writeFile(path, buffer, (err) => {
            if(err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

function addSecurityHeaders(res) {
    res.set('X-Frame-Options', 'SAMEORIGIN');
}

exports.saveAudioSuggestions = async (req, res) => {
    addSecurityHeaders(res);
    return cors(req, res, async () => {
        // convert base64 body to blob of webm
        const nodeBuffer = Buffer.from(req.body, 'base64');
        // convert to mp3
        const fileName = uuid.v1();
        const tempLocalPath = `/tmp/${fileName}.webm`;
        const targetTempFilePath =  `/tmp/${fileName}.mp3`;
        await writeFileAsync(tempLocalPath, nodeBuffer);
        const command = new ffmpeg(tempLocalPath).toFormat('mp3').save(targetTempFilePath);
        await promisifyCommand(command);
        // upload to drive
        const drive = google.drive({version: 'v3', auth: await getGoogleAPIAuthentication()});
        const createResponse = (await drive.files.create({
            requestBody: {
                parents: [ process.env['AUDIO_FOLDER_ID'] ],
                mimeType: 'audio/mp3',
                name: `${fileName}.mp3`
            },
            media: {
                mimeType: 'audio/mp3',
                body: fs.createReadStream(targetTempFilePath),
            }
        }));
        const fileId = createResponse.data.id;
        const file = (await drive.files.get({
            fileId: fileId,
            fields: 'webContentLink'
        })).data;
        console.log(`Audio saved to ${file.webContentLink}.`);
        res.status(200).send(file.webContentLink);
    });
};

async function saveFeedback(spreadsheetId, sheetTitle, data) {
    const sheets = google.sheets({version: 'v4', auth: await getGoogleAPIAuthentication()});
    // find spreadsheet
    const spreadsheet = (await sheets.spreadsheets.get({spreadsheetId: spreadsheetId, fields: 'sheets(properties.title)'})).data;
    if(!spreadsheet) {
        throw new Error("Spreadsheet not found");
    }
    // find sheet
    const sheet = spreadsheet.sheets.find(sh => sh.properties.title === sheetTitle);
    if(!sheet) {
        // sheet does not exist - create it
        await sheets.spreadsheets.batchUpdate({ spreadsheetId: spreadsheetId, requestBody: {
                "requests": [ {
                    "addSheet": {
                        "properties": {
                            "title": sheetTitle,
                            "sheetType": "GRID"
                        }
                    }
                } ]
            } })
    }
    // append data to sheet
    await sheets.spreadsheets.values.append({
        spreadsheetId: spreadsheetId,
        range: sheetTitle + '!A1',
        valueInputOption: 'RAW',
        requestBody: { values: [data] }
    });
}

exports.create_feedback = async (req, res) => {
    addSecurityHeaders(res);
    return cors(req, res, async () => {
        if (!validation.isTargetLanguage(req.body.native_language)) {
            res.status(400).send("Invalid target language");
            return;
        } else if(!validation.isPrimaryLanguage(req.body.language)) {
            res.status(400).send("Invalid primary language");
            return;
        }
        await saveFeedback(process.env['FEEDBACK_SPREADSHEET'], req.body.native_language, [
            req.body.language || '',
            req.body.native_language || '',
            req.body.english_word || '',
            req.body.primary_word || '',
            req.body.translation || '',
            req.body.transliteration || '',
            req.body.suggested_translation || '',
            req.body.suggested_transliteration || '',
            req.body.types ? req.body.types.join(', ') : '',
            req.body.content || '',
            new Date()
        ]);
        res.status(200).send("Feedback saved.");
    });
};

exports.getTranslations = async (req, res) => {
    addSecurityHeaders(res);
    return cors(req, res, async () => {
        const english_words = req.body.english_words;
        const primary_language = req.body.primary_language;
        const target_language = req.body.target_language;
        if (!validation.isTargetLanguage(target_language)) {
            res.status(400).send("Invalid target language");
            return;
        } else if(!validation.isPrimaryLanguage(primary_language)) {
            res.status(400).send("Invalid primary language");
            return;
        } else if(!english_words) {
            res.status(400).send("No words found");
            return;
        }
        for(const w of english_words) {
            if(validation.containsHTML(w)) {
                res.status(400).send("Words cannot contain HTML tags");
                return;
            }
        }
        const promises = english_words.map(async english_word => {
            const wordKey = datastore.key(['Translation', english_word]);
            const translations = await datastore.get(wordKey);
            return { word: english_word, translations: translations && translations.length > 0 ? translations[0] : null };
        });
        Promise.all(promises).then(docs => {
            const translations = docs.map(x => createTranslationResponseForApp(x, primary_language, target_language));
            res.status(200).send(translations);
        }).catch(function(error) {
            console.log("Internal server error", error);
            res.status(500).send(error)
        });
    });
};

function createTranslationResponseForApp(data, primary_language, target_language) {
    const primaryTranslation = data && data.translations ? data.translations[primary_language] : null;
    const targetTranslation = data && data.translations ? data.translations[target_language] : null;
    return {
        english_word: data.word,
        primary_word: primaryTranslation ? primaryTranslation.translation || '' : '',
        translation: targetTranslation ? targetTranslation.translation || '' : '',
        transliteration: targetTranslation ? targetTranslation.transliteration || '' : '',
        sound_link: targetTranslation ? targetTranslation.sound_link || '' : ''
    };
}

exports.mokeTranslations = async (req, res) => {
    addSecurityHeaders(res);
    return cors(req, res, async () => {
        const english_words = req.body.english_words;
        const primary_language = req.body.primary_language;
        const target_language = req.body.target_language;
        if (!validation.isTargetLanguage(target_language)) {
            res.status(400).send("Invalid target language");
            return;
        } else if(!validation.isPrimaryLanguage(primary_language)) {
            res.status(400).send("Invalid primary language");
            return;
        } else if(!english_words) {
            res.status(400).send("No words found");
            return;
        }
        for(const w of english_words) {
            if(validation.containsHTML(w)) {
                res.status(400).send("Words cannot contain HTML tags");
                return;
            }
        }
        const promises = english_words.map(async english_word => {
            const wordKey = datastore.key(['Translation', english_word]);
            const translations = await datastore.get(wordKey);
            return { word: english_word, translations: translations && translations.length > 0 ? translations[0] : null };
        });
        Promise.all(promises).then(docs => {
            const translations = docs.map(x => createTranslationResponseForApp(x, primary_language, target_language));
            res.status(200).send(translations);
        }).catch(function(error) {
            console.log("Internal server error", error);
            res.status(500).send(error)
        });
    });
};

function createTranslationResponseForApp(data, primary_language, target_language) {
    const primaryTranslation = data && data.translations ? data.translations[primary_language] : null;
    const targetTranslation = data && data.translations ? data.translations[target_language] : null;
    return {
        english_word: data.word,
        primary_word: data.word,
        translation: target_language+"-"+data.word,
        transliteration: targetTranslation ? targetTranslation.transliteration || '' : '',
        sound_link: targetTranslation ? targetTranslation.sound_link || '' : ''
    };
}

exports.visionAPI = async (req, res) => {
    addSecurityHeaders(res);
    return cors(req, res, async () => {
        try {
            const requestVision = {
                image: {content: Buffer.from(req.body, 'base64')},
                features: [{type: 'LABEL_DETECTION', maxResults: 10}, {type: 'SAFE_SEARCH_DETECTION'}]
            };
            visionClient.annotateImage(requestVision)
                .then(response => {
                    res.status(200).send(response && response.length > 0 ? response[0] : null);
                    return "200"
                })
                .catch(err => {
                    console.error(err);
                    res.status(500).send(err);
                });
        } catch (err) {
            console.log(`Unable to detect objects: ${err}`)
            res.status(500).send(err);
        }
    });
};