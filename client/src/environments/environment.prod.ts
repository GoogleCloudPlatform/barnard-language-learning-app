import { APIFeedbackService } from "../services/api/feedback";
import { APIImageRecognitionService } from "../services/api/image-recognition";
import { APITranslationService } from "../services/api/translation";
import { GoogleAnalyticsService } from "../services/google/analytics";
import { SafeSearchLikelihood } from "../services/google/image-recognition";
import { LocalProfileService } from "../services/local-profile";
import { params } from "./environment.prod.params";

export const environment = {
	production: true,
	loggingEnabled: true,
	assets: {
		baseUrl: params.assetsBaseUrl,
	},
	i18n: {
		languages: [
			{
				code: "en",
				name: "English",
				file: params.assetsBaseUrl + "assets/locale/en.json",
				direction: "ltr",
				default: params.language === "en",
			},
			{
				code: "fr",
				name: "Français",
				file: params.assetsBaseUrl + "assets/locale/fr.json",
				direction: "ltr",
				default: params.language === "fr",
			},
			{
				code: "es",
				name: "Español",
				file: params.assetsBaseUrl + "assets/locale/es.json",
				direction: "ltr",
				default: params.language === "es",
			},
			/*{
		code: 'hi',
		name: 'हिन्दी',
		file: params.assetsBaseUrl + 'locale/hi.json',
		direction: 'ltr',
		default: params.language === 'hi'
	  },*/
			{
				code: "ar",
				name: "اَلْعَرَبِيَّةُ",
				file: params.assetsBaseUrl + "assets/locale/ar.json",
				direction: "rtl",
				default: params.language === "ar",
			},
			{
				code: "it",
				name: "Italiano",
				file: params.assetsBaseUrl + "assets/locale/it.json",
				direction: "ltr",
				default: params.language === "it",
			},
			/*{
		code: 'pt',
		name: 'Português',
		file: params.assetsBaseUrl + 'assets/locale/pt.json',
		direction: 'ltr',
		default: params.language === 'pt'
	  },
	  {
		code: 'ru',
		name: 'русский',
		file: params.assetsBaseUrl + 'assets/locale/ru.json',
		direction: 'ltr',
		default: params.language === 'ru'
	  },
	  {
		code: 'zh',
		name: '普通话',
		file: params.assetsBaseUrl + 'assets/locale/zh.json',
		direction: 'ltr',
		default: params.language === 'zh'
	  }*/
		],
	},
	endangeredLanguage: params.endangeredLanguage,
	pages: {
		splash: {
			logosDuration: 3500,
			videoMaxStartTime: 3000,
			maxLogosDelay: 2000,
			showLogosVideoPosition: 0.2,
			partnerLogoUrl: params.partnerLogoUrl,
		},
		translate: {},
		captionImage: {},
		termsAndPrivacy: {
			enabled: params.termsAndPrivacyEnabled,
			content: params.termsAndPrivacyContent,
		},
		capture: {
			instructionsDuration: 5000,
		},
	},
	components: {
		snackBar: {
			duration: 3000,
		},
		cameraPreview: {
			resizeDelay: 1000,
		},
		addWordFieldset: {
			maxRecordingDuration: 5000,
			recordingBufferSize: 4096,
			recordingMimeTypes: [
				"audio/mpeg",
				"audio/mp4",
				"audio/webm",
				"audio/wav",
				"audio/x-aiff",
			],
			androidGBoardUrl:
				"https://play.google.com/store/apps/details?id=com.google.android.inputmethod.latin",
			iosGBoardUrl:
				"https://apps.apple.com/us/app/gboard-the-google-keyboard/id1091700242",
			keymanUrl: "https://keyman.com/",
			progressAnimationInterval: 25,
		},
		scrollList: {
			animationInterval: 25,
			snapAcceleration: 0.005,
			snapDeceleration: 0.003,
			snapMaxSpeed: 2,
			snapMinSpeed: 0.01,
			snapDecelerationDistance: 200,
			snapStickyDistance: 30,
			targetPositionRatio: 0.2,
			draggingMinDistance: 10,
		},
		translationSelector: {
			scrollList: {
				animationInterval: 25,
				snapAcceleration: 0.01,
				snapMaxSpeed: 2,
				snapMinSpeed: 0.01,
				snapDecelerationDistance: 200,
				snapStickyDistance: 30,
				targetPositionRatio: 0.2,
				draggingMinDistance: 10,
			},
			selectionLine: {
				animationInterval: 25,
				rotateSpeed: Math.PI * 2.0 * 0.7,
			},
		},
	},
	services: {
		profile: {
			type: LocalProfileService,
			config: null,
		},
		imageRecognition: {
			type: APIImageRecognitionService,
			config: {
				endpointURL: `${params.apiUrl}/visionAPI`,
				maxFileSize: 15 * 1024,
				validImageFormats: [
					"image/png",
					"image/jpg",
					"image/jpeg",
					"image/gif",
					"image/bmp",
					"image/webp",
				],
				resizedImageDimension: 300,
				resizedImageQuality: 0.6,
				maxResults: 10,
				retryCount: 3,
				singleWordDescriptionsOnly: true,
				maxSafeSearchLikelihoods: {
					spoof: SafeSearchLikelihood.VERY_LIKELY,
					medical: SafeSearchLikelihood.POSSIBLE,
					adult: SafeSearchLikelihood.POSSIBLE,
					violence: SafeSearchLikelihood.POSSIBLE,
				},
			},
		},
		imageRendering: {
			config: {
				dropShadowDistance: 1,
				dropShadowColor: "rgba(0, 0, 0, 0.5)",
				foregroundColor: "white",
				languages: {
					font: "30px Product Sans",
					lineHeight: 25,
					lineSpacing: 10,
					marginBottom: 25,
				},
				transliteration: {
					font: "43px Product Sans",
					lineHeight: 35,
					lineSpacing: 10,
					marginBottom: 25,
				},
				translation: {
					font: "30px Product Sans",
					lineHeight: 25,
					lineSpacing: 10,
					marginBottom: 25,
				},
				originalWord: {
					font: "30px Product Sans",
					lineHeight: 25,
					lineSpacing: 10,
					marginBottom: 85,
				},
				line: { width: 1, height: 80, marginBottom: 20 },
				banner: {
					backgroundColor: "white",
					height: 50,
					logoY: 8,
					logoHeight: 20,
					logoURL: params.assetsBaseUrl + "assets/img/logo.png",
					attributionHeight: 20,
					attributionURL:
						params.assetsBaseUrl +
						"assets/img/google_arts_culture_logo.png",
					spacing: 0,
				},
				padding: 20,
			},
		},
		endangeredLanguage: {
			config: {
				languages: [
					{
						code: "yug",
						name: "Yugambeh",
						default: params.endangeredLanguage === "yug",
						sampleWordImageURL:
							params.assetsBaseUrl +
							"assets/img/languages/tree-yug.jpg",
						sampleWordTranslation: "tullei",
						nativeSpeakers: "100000",
						organizationURL:
							"https://www.yugambeh.com/learn-the-language",
						organizationName: "Yugambeh Museum",
					},
					{
						code: "may",
						name: "Maya",
						default: params.endangeredLanguage === "may",
						sampleWordImageURL:
							params.assetsBaseUrl +
							"assets/img/languages/tree-may.jpg",
						sampleWordTranslation: "Ché",
						nativeSpeakers: "6000000",
						organizationURL: "http://alin.inali.gob.mx/xmlui/",
						organizationName: "INALI",
					},
					{
						code: "yi",
						name: "Yiddish",
						default: params.endangeredLanguage === "yi",
						sampleWordImageURL:
							params.assetsBaseUrl +
							"assets/img/languages/tree-yi.jpg",
						sampleWordTranslation: "דער מילגרױם",
						nativeSpeakers: "100000",
						organizationURL:
							"https://jewishstudies.rutgers.edu/yiddish/102-department-of-jewish-studies/yiddish/159-yiddish-faqs",
						organizationName: "Department of Jewish Studies",
					},
					{
						code: "tzm",
						name: "Tamazight",
						default: params.endangeredLanguage === "tzm",
						sampleWordImageURL:
							params.assetsBaseUrl +
							"assets/img/languages/tree-tzm.jpg",
						sampleWordTranslation: "Argan",
						nativeSpeakers: "100000",
						organizationURL:
							"https://www.congres-mondial-amazigh.org/",
						organizationName: "Congres Mondial Amazigh",
					},
					{
						code: "rap",
						name: "Rapa Nui",
						default: params.endangeredLanguage === "rap",
						sampleWordImageURL:
							params.assetsBaseUrl +
							"assets/img/languages/tree-rap.jpg",
						sampleWordTranslation: "Toromiro",
						nativeSpeakers: "100000",
						organizationURL:
							"https://en.unesco.org/courier/2019-1/rapa-nui-back-brink",
						organizationName: "Council of the Elders of Rapa Nui",
					},
					{
						code: "ppl",
						name: "Nawat",
						default: params.endangeredLanguage === "ppl",
						sampleWordImageURL:
							params.assetsBaseUrl +
							"assets/img/languages/tree-ppl.jpg",
						sampleWordTranslation: "Puchut",
						nativeSpeakers: "100000",
						organizationURL: "http://www.tushik.org",
						organizationName: "Tushik",
					},
					{
						code: "mi",
						name: "Māori",
						default: params.endangeredLanguage === "mi",
						sampleWordImageURL:
							params.assetsBaseUrl +
							"assets/img/languages/tree-mi.jpg",
						sampleWordTranslation: "kōwhai",
						nativeSpeakers: "100000",
						organizationURL: "https://temurumara.org.nz/",
						organizationName: "Te Murumāra Foundation",
					},
					{
						code: "el-cal",
						name: "Calabrian Greek",
						default: params.endangeredLanguage === "el-cal",
						sampleWordImageURL:
							params.assetsBaseUrl +
							"assets/img/languages/tree-el-cal.jpg",
						sampleWordTranslation: "Pero selvatico",
						nativeSpeakers: "100000",
						organizationURL: "https://calabriagreca.it/",
						organizationName: "Associazione Ellenofona Jalò tu Vua",
					},
					{
						code: "scn",
						name: "Sicilian",
						default: params.endangeredLanguage === "scn",
						sampleWordImageURL:
							params.assetsBaseUrl +
							"assets/img/languages/tree-scn.jpg",
						sampleWordTranslation: "Ficu d'Innia",
						nativeSpeakers: "100000",
						organizationURL: "https://cademiasiciliana.org",
						organizationName: "Cademia Siciliana",
					},
					{
						code: "lou",
						name: "Louisiana Creole",
						default: params.endangeredLanguage === "lou",
						sampleWordImageURL:
							params.assetsBaseUrl +
							"assets/img/languages/tree-lou.jpg",
						sampleWordTranslation: "sip",
						nativeSpeakers: "100000",
						organizationURL: "https://learnlouisianacreole.com/",
						organizationName: "Ti Liv Kréyòl",
					},
					{
						code: "zyg",
						name: "Yang Zhuang",
						default: params.endangeredLanguage === "zyg",
						sampleWordImageURL:
							params.assetsBaseUrl +
							"assets/img/languages/tree-zyg.jpg",
						sampleWordTranslation: "ko máy",
						nativeSpeakers: "100000",
						organizationURL:
							"https://www.youtube.com/watch?v=WuN43huPnuM",
						organizationName:
							"Museum of Ethnic Cultures at Minzu University",
					},
					{
						code: "tep",
						name: "Tepehua",
						default: false,
						sampleWordImageURL:
							params.assetsBaseUrl +
							"assets/img/languages/tree-tep.jpg",
						sampleWordTranslation: "k'iu",
						nativeSpeakers: "9000",
						organizationURL: "http://alin.inali.gob.mx/xmlui/",
						organizationName: "INALI",
					},
					{
						code: "vm",
						name: "Vurës",
						default: false,
						sampleWordImageURL:
							params.assetsBaseUrl +
							"assets/img/languages/tree-vm.jpg",
						sampleWordTranslation: "rēntenge",
						nativeSpeakers: "2000",
						organizationURL:
							"https://www.newcastle.edu.au/research/centre/endangered-languages-documentation-theory-and-application",
						organizationName: "University of Newcastle",
					},
					{
						code: "pot",
						name: "Potawatomi",
						default: false,
						sampleWordImageURL:
							params.assetsBaseUrl +
							"assets/img/languages/tree-pot.jpg",
						sampleWordTranslation: "mtek",
						nativeSpeakers: "7000",
						organizationURL: "https://www.potawatomi.org/",
						organizationName: "Citizen Potawatomi Nation",
					},
					{
						code: "rom",
						name: "Serravallese",
						default: false,
						sampleWordImageURL:
							params.assetsBaseUrl +
							"assets/img/languages/tree-rom.jpg",
						sampleWordTranslation: "öibri",
						nativeSpeakers: "7000",
						organizationURL: "https://www.dialettoromagnolo.it/",
						organizationName: "Friedrich Schürr Institute",
					},
					{
						code: "san",
						name: "Sanskrit",
						default: false,
						sampleWordImageURL:
							params.assetsBaseUrl +
							"assets/img/languages/tree-san.jpg",
						sampleWordTranslation: "vr̥kṣaḥ",
						nativeSpeakers: "14135",
						organizationURL: "",
						organizationName: "-",
					},
					{
						code: "kum",
						name: "Kumeyaay / Diegueño",
						default: false,
						sampleWordImageURL:
							params.assetsBaseUrl +
							"assets/img/languages/tree-kum.jpg",
						sampleWordTranslation: "ily",
						nativeSpeakers: "500",
						organizationURL: "https://www.baronamuseum.com/",
						organizationName: "Barona Cultural Center & Museum",
					},
				],
				assetsImageURL: `${params.assetsImageURL}/`,
				endangeredLanguageEndpoint: `${params.apiUrl}/get_region_languages`,
				regionEndpoint: `${params.apiUrl}/get_regions`,
			},
		},
		translation: {
			type: APITranslationService,
			config: {
				endpointURL: `${params.apiUrl}/get_translations`,
			},
		},
		sentence: {
			type: APITranslationService,
			config: {
				endpointURL: `${params.apiUrl}/get_sentences`
			}
		},
		analytics: {
			type: GoogleAnalyticsService,
			config: {
				trackerID: params.googleTrackerId,
			},
		},
		feedback: {
			type: APIFeedbackService,
			config: {
				addWordAudioEndpointURL: `${params.apiUrl}/saveAudioSuggestions`,
				feedbackEndpointURL: `${params.apiUrl}/create_feedback/`,
			},
		},
	},
};
