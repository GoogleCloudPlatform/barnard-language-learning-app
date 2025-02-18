/**
 * API v3 contains changes to save high scores at the host level.
 * API v4 contains changes for retrieving the referral score from the handshake.
 * API v5 contains changes to retrieve the game save from the handshake.
 * [DEPRECATED] API v6 contains changes for embedded games.
 * API v7 contains changes to support files sharing.
 * API v8 contains changes to support saving the game state at any times.
 * API v9 adds Development mode and changes to games embedding (deprecates v6).
 * API V10 adds a message to trigger feedback dialog.
 * API V11 adds support for SMLG app.
 * API V12 add local dev mode detection (skips handshake).
 * API V13 add close button control for allowlisted experiments.
 * API V14 adds dark mode support in the capabilities.
 */
const API_VERSION = 14;

// Private consts.

/** @const {number} */
const HANDSHAKE_INTERVAL_MS = 500;
/** @const {number} */
const SMLG_HANDSHAKE_INTERVAL_MS = 50;
/** @const {string} */
const CHILD_TO_HOST_HANDSHAKE = 'hpi';
/** @const {string} */
const HOST_TO_CHILD_HANDSHAKE = 'hpo';
/** @const {number} */
const MAX_STORAGE_BYTES = 32000;

/**
 * Whether we're in development mode. Somewhat obfuscated.
 */
const DEV_MODE = !!window[['_y', 1].join(Math.floor(Math.random())) + 0];

/**
 * Whether we're in local + top frame development mode (skips handhsake).
 */
const LOCAL_DEV_MODE = DEV_MODE && document.location.hostname == 'localhost' &&
    window.self == window.top;

/**
 * SMLG object if available.
 */
const SMLG = window['__gci_axl'];

/**
 * Checks that the host is a *.google(rs).com or the embed.culturalspot.org
 * domain for embedded games. Private.
 * @param {string} origin
 * @return {boolean}
 */
const isTrustedOrigin = (origin) => {
  return DEV_MODE || !!SMLG ||
      !!origin.match(
          /^https?\:\/\/((([\w-]*\.)+google(rs)?\.com)|(embed\.culturalspot\.org)|(([\w-]*\.)+appspot\.com))(?:[\/:?#]|$)/i);
};

(function() {

// Callback placeholder that will wait until document.body is available.
let afterBodyParsed = () => {};

if (DEV_MODE) {
  const label = 'Development mode';
  afterBodyParsed = () => {
    const watermarkEl = document.createElement('div');
    watermarkEl.innerText = label;
    const rules = {
      background: 'rgba(255,0,0,.75)',
      color: '#fff',
      fontFamily: 'Arial',
      fontSize: '10px',
      left: 0,
      padding: '10px',
      position: 'fixed',
      bottom: 0,
      zIndex: 9999,
      fontWeight: 'bold',
    };
    Object.assign(watermarkEl.style, rules);
    document.body.appendChild(watermarkEl);
  };

  const prefixStyle = 'color:teal';
  console.log(`%cAxL v${API_VERSION} ${label}`, prefixStyle);
} else {
  // Agressively kill all console.log outputs.
  window['console']['log'] = () => {};

  afterBodyParsed = () => {
    // Hack to detect non-iframe mode and block content.
    if (window.self === window.top && !navigator.userAgent.includes('SMLG')) {
      document.body.textContent =
          'This experiment is not available on this platform.';
      window.close();
      // Throw to interrupt the app ASAP.
      throw ('Experiment unavailable on this platform.');
    }

    // Hack to detect iframing from an unauthorized domain and block content.
    if (document.referrer && document.referrer !== '' &&
        !isTrustedOrigin(document.referrer)) {
      document.body.textContent =
          'This experiment is not available for embedding.';
      window.close();
      throw ('Experiment unavailable for embedding.');
    }
  };
}

let observer;
const check = () => {
  if (document.body) {
    afterBodyParsed();
    observer && observer.disconnect();
  }
};
observer = new MutationObserver(check);
observer.observe(document.documentElement, {childList: true});
check();
})();

/**
 * @param {*} val
 * @return {number}
 */
const countBytes = (val) => {
  return new Blob([JSON.stringify(val)]).size;
};

/**
 * Test localStorage access. If not available, will issue a console warning and
 * the AxL.storage should still work as a volatile key/value store.
 */
let ls = null;
try {
  ls = window.localStorage;
} catch (e) {
  console.warn(e);
}

/**
 * A storage service implementation, currently relying on localStorage. Provides
 * a stable interface to the client, prevents collsions with other clients on
 * the same domain, and enforces quota restrictions. Also supports delegating
 * saving of High Scores to the Host.
 */
class AxLStorage {
  /**
   * @param {string} storageKey
   * @param {function(!AxL.ChildToHost, !Object)} sendMessageCallback
   * @param {number|undefined} initHighScore initial high score supplied by
   *     Stella.
   * @param {number|undefined} referralScore referral score supplied by Stella.
   *     It represents the score of a third-party user that we'd like to beat.
   * @param {!Object|undefined} highScoreData object that represents the high
   *     score data, used to start the game where the user left off. The object
   * must be JSON serializable.
   */
  constructor(
      storageKey, sendMessageCallback, initHighScore, referralScore,
      highScoreData) {
    /** @private @const {string} */
    this.storageKey_ = storageKey;

    /** @private {!Map<string, *>} */
    this.storageMap_ = new Map();

    /** @private @const {function(!AxL.ChildToHost, !Object)} */
    this.sendMessageCallback_ = sendMessageCallback;

    /** @private @const {number|undefined} */
    this.referralScore_ = referralScore;

    /** @private {!Object} */
    this.currentHighScoreObject_ = {
      's': initHighScore,
      'd': highScoreData,
    };

    // If the high score saving is delegated to Stella and no init high score
    // has been provided, try taking the high score from the local storage.
    if (AxL.can['delegateSaving'] && !initHighScore) {
      const localHighScore = this.getHighScoreInLocalStorage_();

      const localHighScoreNumber = localHighScore['s'];
      if (localHighScoreNumber) {
        this.currentHighScoreObject_['s'] = localHighScoreNumber;
      }
      const localHighScoreData = localHighScore['d'];
      if (localHighScoreData) {
        this.currentHighScoreObject_['d'] = localHighScoreData;
      }

      // If there is actually a local high score number, try saving it along
      // with the data.
      if (localHighScoreNumber !== undefined) {
        // Send a message up to Stella to save this local storage high score in
        // database.
        this.sendMessageCallback_(
            AxL.ChildToHost.SAVE_HIGH_SCORE_FROM_LOCALSTORAGE,
            this.currentHighScoreObject_);
      }
    }

    this.loadStorage_();
  }

  /**
   * @private
   */
  loadStorage_() {
    this.storageMap_ = new Map();
    try {
      const dataObj = JSON.parse(ls && ls.getItem(this.storageKey_) || '{}');
      this.storageMap_ =
          new Map(Object.entries(/** @type {!Object} */ (dataObj)));
    } catch (e) {
    }
  }

  /**
   * @private
   */
  syncStorage_() {
    if (!ls) {
      return;
    }
    ls.setItem(this.storageKey_ + '#ts', Date.now() + '');
    ls.setItem(
        this.storageKey_, JSON.stringify(Object.fromEntries(this.storageMap_)));
  }

  /**
   * @param {string} key
   * @return {!Promise<*>}
   * @export
   */
  getItem(key) {
    return Promise.resolve(this.storageMap_.get(key));
  }

  /**
   * @param {string} key
   * @param {*} value
   * @return {!Promise<number>}
   * @export
   */
  setItem(key, value) {
    return new Promise((resolve, reject) => {
      try {
        if (this.bytesUsed - countBytes(this.storageMap_.get(key)) +
                countBytes(value) >=
            MAX_STORAGE_BYTES) {
          reject(new Error('Storage quota exceeded'));
          return;
        }
        this.storageMap_.set(key, value);
        this.syncStorage_();
        resolve(this.usage);
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * @param {string} key
   * @return {!Promise<number>}
   * @export
   */
  removeItem(key) {
    return new Promise((resolve, reject) => {
      this.storageMap_.delete(key);
      this.syncStorage_();
      resolve(this.usage);
    });
  }

  /**
   * Public exported method to save a new high score.
   * @param {number} score
   * @param {!Object=} optionalData extra state to save along with the high
   *     score to be able to continue where the user left off.
   * @param {!AxL.ScoreUnit=} scoreUnit Unit to represent the score (number of
   *     points, time, etc). Defaults to a number.
   * @param {boolean=} lowerScoreIsBetter whether or not a lower score is going
   *     to be considered better. Defaults to false.
   * @return {!Promise<number>}
   * @export
   */
  setHighScore(
      score, optionalData, scoreUnit = AxL.ScoreUnit.POINTS,
      lowerScoreIsBetter = false) {
    const scoreObj = {
      's': score,
      'd': optionalData,
      'u': scoreUnit,
      'lb': lowerScoreIsBetter,
    };

    // If we should delegate saving, we send an message up to the host.
    if (AxL.can['delegateSaving']) {
      // Save the new high score object.
      this.currentHighScoreObject_ = scoreObj;

      return new Promise((resolve, reject) => {
        this.sendMessageCallback_(AxL.ChildToHost.SAVE_HIGH_SCORE, scoreObj);

        // TODO(dcamilleri): add a handshake to set the high score in the local
        // storage in case storing with the host failed.
        resolve();
      });
    }

    return new Promise((resolve, reject) => {
      if (!ls) {
        reject(new Error('Storage not available'));
        return;
      }
      try {
        if (this.bytesUsed - countBytes(ls.getItem(this.storageKey_ + '#hs')) +
                countBytes(scoreObj) >=
            MAX_STORAGE_BYTES) {
          reject(new Error('Storage quota exceeded'));
          return;
        }
        const localHighScore = this.getHighScoreInLocalStorage_();

        // If the new score isn't better than the old one (based on the
        // scoreUnit provided, or the default one), let's reject that request.
        switch (scoreUnit) {
          case AxL.ScoreUnit.POINTS:
          case AxL.ScoreUnit.PERCENTAGE:
            if (score <= localHighScore['s']) {
              reject(new Error('Not highest score.'));
              return;
            }
            break;
          case AxL.ScoreUnit.TIME_MILLIS:
            if (score >= localHighScore['s']) {
              reject(new Error('Not highest score.'));
              return;
            }
            break;
          default:
            break;
        }

        ls.setItem(this.storageKey_ + '#ts', Date.now() + '');
        ls.setItem(this.storageKey_ + '#hs', JSON.stringify(scoreObj));
        resolve(this.usage);
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Public exported method to save a game state at any point in the game.
   * @param {!Object} gameStateObject state object to save to be able to
   *     continue where the user left off. Can contain any info related to the
   * game, eg the current level, which artwork the user has unlocked, etc.
   * @return {!Promise<undefined>}
   * @export
   */
  setGameState(gameStateObject) {
    if (!AxL.can['delegateSaving']) {
      return Promise.reject('Can\'t save Game State');
    }

    // If we should delegate saving, we send an message up to the host.
    // Store the new game state into the global high score object.
    this.currentHighScoreObject_['d'] = gameStateObject;
    return new Promise((resolve, reject) => {
      this.sendMessageCallback_(
          AxL.ChildToHost.SAVE_GAME_STATE, gameStateObject);
      resolve();
    });
  }

  /**
   * If saving of high scores is delegated to Stella, returns the initial game
   * state data provided by the handshake or any new state that has been
   * saved since. This data is stored in the global high score object.
   * @return {!Promise<?Object>}
   * @export
   */
  getGameState() {
    if (!AxL.can['delegateSaving']) {
      return Promise.reject('Can\'t get Game State');
    }

    return Promise.resolve(this.currentHighScoreObject_['d']);
  }

  /**
   * Retrieves the high score from the local storage.
   * @private
   * @return {!Object}
   */
  getHighScoreInLocalStorage_() {
    return /** @type {!Object} */ (
        JSON.parse(ls && ls.getItem(this.storageKey_ + '#hs') || '{}'));
  }

  /**
   * Public method to retrieve the user's high score. High score is retrieved:
   * - From ContribService through Stella if the Stella high score integration
   * is launched.
   * - From a local storage otherwise.
   * @return {!Promise<?number>}
   * @export
   */
  getHighScore() {
    // If saving of high scores is delegated to Stella, return the initial high
    // score provided or any new score that has been saved since.
    if (AxL.can['delegateSaving']) {
      return Promise.resolve(this.currentHighScoreObject_['s']);
    }

    // Otherwise take the score from the local storage.
    const scoreObj = this.getHighScoreInLocalStorage_();
    return Promise.resolve(scoreObj['s']);
  }

  /**
   * Public method to retrieve the referral score. This data is supplied during
   * the handshake.
   * @return {!Promise<number|undefined>}
   * @export
   */
  getReferralScore() {
    return Promise.resolve(this.referralScore_);
  }

  /**
   * @return {!Promise<undefined>}
   * @export
   */
  flush() {
    if (ls) {
      ls.removeItem(this.storageKey_);
      ls.removeItem(this.storageKey_ + '#ts');
      ls.removeItem(this.storageKey_ + '#hs');
    }
    this.storageMap_ = new Map();
    return Promise.resolve();
  }

  /**
   * @return {number}
   * @export
   */
  get lastChange() {
    if (!ls) {
      return -1;
    }
    let ts = ls.getItem(this.storageKey_ + '#ts');
    return ts ? parseInt(ls.getItem(this.storageKey_ + '#ts'), 10) : Date.now();
  }

  /**
   * @return {number}
   */
  get bytesUsed() {
    if (!ls) {
      return 0;
    }
    const keys =
        Object.keys(ls || {}).filter(key => key.includes(this.storageKey_));
    const values = keys.map(key => ls[key]);
    return new Blob(keys).size + new Blob(values).size;
  }

  /**
   * @return {number}
   * @export
   */
  get usage() {
    return this.bytesUsed / MAX_STORAGE_BYTES;
  }

  /**
   * @return {boolean}
   * @export
   */
  get isLocalStorage() {
    return !!ls;
  }
}

class AxL {
  constructor(hostWindow = window.parent) {
    /** @private @const {!Window} */
    this.hostWindow_ = hostWindow;

    /** @private {?string} */
    this.hostOrigin_ = null;

    /** @private @const {!Map<!AxL.HostToChild, !Function>} */
    this.callbacks_ = new Map();

    /** @private {?Function} */
    this.boundMessageHandler_ = null;

    /** @export {?AxLStorage} */
    this.storage = null;

    const defaultHandshakeInterval =
        !!SMLG ? SMLG_HANDSHAKE_INTERVAL_MS : HANDSHAKE_INTERVAL_MS;
    const params = new URLSearchParams(window.location.search);
    const hiOverrideParam = !!SMLG ? 'axlshi' : 'axlhi';
    /** @private @const {number} */
    this.handshakeInterval_ =
        parseInt(params.get(hiOverrideParam), 10) || defaultHandshakeInterval;
  }

  /**
   * Pings the host every 1000ms and returns a Promise that resolves when the
   * host responds. Call this when the app is ready to go.
   * @return {!Promise<!Object>}
   * @export
   */
  handshake() {
    if (LOCAL_DEV_MODE) {
      console.log('Local dev mode detected, skipping handshake.');
      return Promise.resolve({});
    }
    let interval;
    const promise = new Promise((resolve, reject) => {
      const handleGetResponse = e => {
        if (!isTrustedOrigin(e['origin'])) {
          console.error(
              `Blocked message from non trusted origin ${e['origin']}.`);
          return;
        }
        if (!e['data'] || e['data']['type'] != HOST_TO_CHILD_HANDSHAKE) {
          return;
        }
        try {
          clearInterval(interval);
          this.hostOrigin_ = e['origin'] || '*';
          this.boundMessageHandler_ = (event) => {
            this.handleIncomingMessage_(event);
          };
          window.addEventListener('message', this.boundMessageHandler_);
          window.removeEventListener('message', handleGetResponse);

          // Retrieving system data.
          const sysCmd = e['data']['sys'];

          if (e['data']['id']) {
            const storageSendMessageCallback =
                (childToHostMessageType, payload) => {
                  this.sendMessage(childToHostMessageType, payload);
                };

            let initHighScore = undefined;
            let referralScore = undefined;
            let highScoreData = undefined;

            // Handling high scores data supplied by Stella in the system data.
            if (sysCmd) {
              AxL.can['delegateSaving'] = !!sysCmd['ds'];
              initHighScore = sysCmd['hs'];
              referralScore = sysCmd['rs'];
              highScoreData = sysCmd['hsd'];
            }

            this.storage = new AxLStorage(
                e['data']['id'], storageSendMessageCallback, initHighScore,
                referralScore, highScoreData);
          }

          if (sysCmd) {
            if (sysCmd['fb'] && this.storage.lastChange < sysCmd['fb']) {
              this.storage.flush();
            }
            const capabilities = sysCmd['c'];
            if (capabilities) {
              AxL.can['shareFiles'] = !!capabilities['sf'];
              AxL.can['download'] = !!capabilities['d'];
              AxL.can['useAltIcon'] = !!capabilities['uai'];
              AxL.can['sendFeedback'] = !!capabilities['f'];
              AxL.can['toggleExitButton'] = !!capabilities['te'];
              AxL.can['preferDarkMode'] = !!capabilities['dme'];
            }
          }
          resolve(e['data']['payload']);
        } catch (error) {
          reject(error);
        }
      };
      window.addEventListener('message', handleGetResponse);
    });
    interval = setInterval(() => {
      this.sendMessage(CHILD_TO_HOST_HANDSHAKE, {'v': API_VERSION});
    }, this.handshakeInterval_);
    return promise;
  }

  /**
   * Public method to send messages to the host along with optional data.
   * @param {!AxL.ChildToHost|string} childToHostMessageType
   * @param {?Object=} payload
   * @export
   */
  sendMessage(childToHostMessageType, payload = null) {
    if (!this.hostOrigin_ &&
        childToHostMessageType != CHILD_TO_HOST_HANDSHAKE) {
      console.warn('Host is not identified, initiate a handshake first.');
      return;
    }
    const message = {'type': childToHostMessageType, 'payload': payload};
    if (!!SMLG) {
      SMLG.postMessage(JSON.stringify(message));
    } else {
      this.hostWindow_.postMessage(message, this.hostOrigin_ || '*');
    }
  }

  /**
   * Removes the incoming messages listener, clears any registered callback
   * and breaks the handshake.
   * @export
   */
  dispose() {
    this.hostOrigin_ = null;
    this.boundMessageHandler_ &&
        window.removeEventListener('message', this.boundMessageHandler_);
    this.callbacks_.clear();
  }

  /**
   * Registers a callback upon receiving a given Host message.
   * @param {!AxL.HostToChild} hostToChildMessageType
   * @param {!Function} callback
   * @export
   */
  registerMessageCallback(hostToChildMessageType, callback) {
    this.callbacks_.set(hostToChildMessageType, callback);
  }

  /**
   * Private handler method for incoming messages.
   * @param {!Event} event
   * @private
   */
  handleIncomingMessage_(event) {
    if (!isTrustedOrigin(event['origin'])) {
      console.error('Blocked message from a non trusted origin.');
      return;
    }
    if (!event['data']) {
      return;
    }
    const callback = this.callbacks_.get(event['data']['type']);
    callback && callback(event['data']['payload']);
  }
}

/**
 * Indicates the framework and device capabilities. This is actually populated
 * when the handshake is completed.
 * @const {!Object<string, boolean>}
 */
AxL.can = {
  'shareFiles': false,  // Whether the SHARE message can accept files.
  'download': false,    // Whether file download is supported on the platform.
  'useAltIcon': false,  // True for iOS, for using appropriate share icons.
  'delegateSaving':
      false,              // Whether saving data should be delegated to Stella.
  'sendFeedback': false,  // True if the GAC feedback feature is available.
  'toggleExitButton':
      false,                // True if the experiment can hide the exit button.
  'preferDarkMode': false,  // True if the sandboxer prefers that the UI is
                            // displayed in dark theme.
};

// List of valid message types. Should match those defined by Stella.

/**
 * Events sent from the child (eg the game) to the host (eg Stella) of the
 * iframe.
 * @enum {string}
 */
AxL.ChildToHost = {
  'FEEDBACK': 'f',
  'NAVIGATE': 'n',
  'SET_URL_PARAMS': 'p',
  'SHARE': 's',
  'TOGGLE_EXIT_BUTTON': 'te',
  'TRACK': 't',
  'SAVE_HIGH_SCORE': 'hs',
  'SAVE_HIGH_SCORE_FROM_LOCALSTORAGE': 'hsl',
  'SAVE_GAME_STATE': 'gs',
};

/**
 * Events sent from the host of the iframe (eg Stella) to the child (eg the
 * game).
 * @enum {string}
 */
AxL.HostToChild = {
  'FREEZE': 'f',
  'RESUME': 'r',
};

/**
 * Representation of the unit of the game's score.
 * @enum {string}
 */
AxL.ScoreUnit = {
  // Score represents an integer number of points.
  'POINTS': 'p',
  // Score represents a time in milliseconds.
  'TIME_MILLIS': 'tm',
  // Score represents a percentage of completion.
  'PERCENTAGE': 'pc',
};

/** @const {number} */
AxL.v = API_VERSION;

export default AxL;
