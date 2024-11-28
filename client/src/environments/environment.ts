import { APIFeedbackService } from "../services/api/feedback";
import { APIImageRecognitionService } from "../services/api/image-recognition";
import { APITranslationService } from "../services/api/translation";
import { SafeSearchLikelihood } from "../services/google/image-recognition";
import { LocalProfileService } from "../services/local-profile";
import { MockAnalyticsService } from "../services/mock/analytics";
import { params } from "./environment.prod.params";

const baseEndpointUrl =
	"https://australia-southeast1-woolaroo-project.cloudfunctions.net";
const localEndpointUrl = "http://localhost:8083";
const debugImageUrl = "/assets/debug/IMG_20190920_141505.jpg";
const newBaseURL = "https://woolaroo-b9v1uynn.uc.gateway.dev";

export const environment = {
	production: true,
	loggingEnabled: true,
	assets: {
		baseUrl: "/woolaroo/",
	},
	i18n: {
		languages: [
			{
				code: "en",
				name: "English",
				file: params.assetsBaseUrl + "assets/locale/en.json",
				direction: "ltr",
				default: true,
			},
			{
				code: "fr",
				name: "Français",
				file: params.assetsBaseUrl + "assets/locale/fr.json",
				direction: "ltr",
			},
			{
				code: "es",
				name: "Español",
				file: params.assetsBaseUrl + "assets/locale/es.json",
				direction: "ltr",
			},
			/*{
        code: 'hi',
        name: 'हिन्दी',
        file: params.assetsBaseUrl + 'assets/locale/hi.json',
        direction: 'ltr'
      },*/
			{
				code: "ar",
				name: "اَلْعَرَبِيَّةُ",
				file: params.assetsBaseUrl + "assets/locale/ar.json",
				direction: "rtl",
			},
			{
				code: "it",
				name: "Italiano",
				file: params.assetsBaseUrl + "assets/locale/it.json",
				direction: "ltr",
			},
			/*{
        code: 'pt',
        name: 'Português',
        file: params.assetsBaseUrl + 'assets/locale/pt.json',
        direction: 'ltr'
      },
      {
        code: 'ru',
        name: 'русский',
        file: params.assetsBaseUrl + 'assets/locale/ru.json',
        direction: 'ltr'
      },
      {
        code: 'zh',
        name: '普通话',
        file: params.assetsBaseUrl + 'assets/locale/zh.json',
        direction: 'ltr'
      }*/
		],
	},
	pages: {
		splash: {
			logosDuration: 3500,
			videoMaxStartTime: 3000,
			maxLogosDelay: 2000,
			showLogosVideoPosition: 0.2,
			partnerLogoUrl: "/assets/debug/partner-logo.png",
		},
		translate: {
			debugImageUrl,
			debugWords: ["technology", "garbage", "book"],
		},
		termsAndPrivacy: {
			enabled: true,
			content:
				'<b>Terms and Privacy</b><br /><a target="_blank" href="https://www.google.com/intl/en/policies/terms/">Google terms of use</a><br /><a target="_blank" href="https://www.google.com/intl/en/policies/privacy/">Google privacy policy</a>',
		},
		captionImage: {
			debugImageUrl,
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
				endpointURL: `${newBaseURL}/visionAPI/`,
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
		// imageRecognition: {
		// 	type: MockImageRecognitionService,
		// 	config: null,
		// },
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
					logoURL: "assets/img/logo.png",
					attributionHeight: 20,
					attributionURL: "assets/img/google_arts_culture_logo.png",
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
						default: true,
						sampleWordImageURL:
							params.assetsBaseUrl +
							"assets/img/languages/tree-yug.jpg",
						sampleWordTranslation: "tullei",
						nativeSpeakers: "100000",
						organizationURL:
							"https://www.yugambeh.com/learn-the-language",
						organizationName: "Yugambeh Museum",
						region: "Oceania",
					},
					{
						code: "may",
						name: "Maya",
						default: false,
						sampleWordImageURL:
							params.assetsBaseUrl +
							"assets/img/languages/tree-may.jpg",
						sampleWordTranslation: "Ché",
						nativeSpeakers: "6000000",
						organizationURL: "http://alin.inali.gob.mx/xmlui/",
						organizationName: "INALI",
						region: "Americas",
					},
					{
						code: "yi",
						name: "Yiddish",
						default: false,
						sampleWordImageURL:
							params.assetsBaseUrl +
							"assets/img/languages/tree-yi.jpg",
						sampleWordTranslation: "דער מילגרױם",
						nativeSpeakers: "100000",
						organizationURL:
							"https://jewishstudies.rutgers.edu/yiddish/102-department-of-jewish-studies/yiddish/159-yiddish-faqs",
						organizationName: "Department of Jewish Studies",
						region: "Europe",
					},
					{
						code: "tzm",
						name: "Tamazight",
						default: false,
						sampleWordImageURL:
							params.assetsBaseUrl +
							"assets/img/languages/tree-tzm.jpg",
						sampleWordTranslation: "Argan",
						nativeSpeakers: "100000",
						organizationURL:
							"https://www.congres-mondial-amazigh.org/",
						organizationName: "Congres Mondial Amazigh",
						region: "Africa",
					},
					{
						code: "rap",
						name: "Rapa Nui",
						default: false,
						sampleWordImageURL:
							params.assetsBaseUrl +
							"assets/img/languages/tree-rap.jpg",
						sampleWordTranslation: "Toromiro",
						nativeSpeakers: "100000",
						organizationURL:
							"https://en.unesco.org/courier/2019-1/rapa-nui-back-brink",
						organizationName: "Council of the Elders of Rapa Nui",
						region: "Oceania",
					},
					{
						code: "ppl",
						name: "Nawat",
						default: false,
						sampleWordImageURL:
							params.assetsBaseUrl +
							"assets/img/languages/tree-ppl.jpg",
						sampleWordTranslation: "Puchut",
						nativeSpeakers: "100000",
						organizationURL: "http://www.tushik.org",
						organizationName: "Tushik",
						region: "Americas",
					},
					{
						code: "mi",
						name: "Māori",
						default: false,
						sampleWordImageURL:
							params.assetsBaseUrl +
							"assets/img/languages/tree-mi.jpg",
						sampleWordTranslation: "kōwhai",
						nativeSpeakers: "100000",
						organizationURL: "https://temurumara.org.nz/",
						organizationName: "Te Murumāra Foundation",
						region: "Oceania",
					},
					{
						code: "el-cal",
						name: "Calabrian Greek",
						default: false,
						sampleWordImageURL:
							params.assetsBaseUrl +
							"assets/img/languages/tree-el-cal.jpg",
						sampleWordTranslation: "Pero selvatico",
						nativeSpeakers: "100000",
						organizationURL: "https://calabriagreca.it/",
						organizationName: "Associazione Ellenofona Jalò tu Vua",
						region: "Europe",
					},
					{
						code: "scn",
						name: "Sicilian",
						default: false,
						sampleWordImageURL:
							params.assetsBaseUrl +
							"assets/img/languages/tree-scn.jpg",
						sampleWordTranslation: "Ficu d'Innia",
						nativeSpeakers: "100000",
						organizationURL: "https://cademiasiciliana.org",
						organizationName: "Cademia Siciliana",
						region: "Europe",
					},
					{
						code: "lou",
						name: "Louisiana Creole",
						default: false,
						sampleWordImageURL:
							params.assetsBaseUrl +
							"assets/img/languages/tree-lou.jpg",
						sampleWordTranslation: "sip",
						nativeSpeakers: "100000",
						organizationURL: "https://learnlouisianacreole.com/",
						organizationName: "Ti Liv Kréyòl",
						region: "Americas",
					},
					{
						code: "zyg",
						name: "Yang Zhuang",
						default: false,
						sampleWordImageURL:
							params.assetsBaseUrl +
							"assets/img/languages/tree-zyg.jpg",
						sampleWordTranslation: "narb",
						nativeSpeakers: "100000",
						organizationURL:
							"https://www.youtube.com/watch?v=WuN43huPnuM",
						organizationName:
							"Museum of Ethnic Cultures at Minzu University",
						region: "Asia",
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
						region: "Americas",
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
						region: "Americas",
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
						region: "Oceania",
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
						region: "Europe",
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
						region: "Asia",
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
						region: "Americas",
					},
				],
				endangeredLanguageEndpoint: `${newBaseURL}/get_region_languages`,
				regionEndpoint: `${newBaseURL}/get_regions`,
				assetsImageURL:
					"https://storage.googleapis.com/woolaroo_media/",
			},
		},
		translation: {
			// type: MockTranslationService,
			type: APITranslationService,
			config: {
				// endpointURL: `${baseEndpointUrl}/getTranslations`,
				endpointURL: `${newBaseURL}/get_translations`,
				// endpointURL: `${localEndpointUrl}`,
			},
		},
			sentence: {
			// type: MockTranslationService,
			type: APITranslationService,
			config: {
				// endpointURL: `${baseEndpointUrl}/getTranslations`,
				endpointURL: `${newBaseURL}/get_sentences`,
				// endpointURL: `${localEndpointUrl}`,
			},
		},
		analytics: {
			type: MockAnalyticsService,
			config: null,
		},
		feedback: {
			type: APIFeedbackService,
			config: {
				feedbackEndpointURL: `${newBaseURL}/create_feedback`,
			},
		},
	},
};
