import {
	EventEmitter,
	Inject,
	Injectable,
	InjectionToken,
} from "@angular/core";
import { getLogger } from "../util/logging";
import { HttpClient } from "@angular/common/http";
import { I18nService } from "../i18n/i18n.service";

const logger = getLogger("EndangeredLanguageService");

export interface EndangeredLanguage {
	code: string;
	name: string;
	default: boolean;
	apiURL: string;
	organizationName: string;
	organizationURL: string;
	sampleWordImageURL: string;
	sampleWordTranslation: string;
	nativeSpeakers: string;
	region: string;
	shortDescriptions: any;
	descriptions: any;
	displayRegions: any;
}

interface EndangeredLanguageConfig {
	languages: EndangeredLanguage[];
	endangeredLanguageEndpoint: string;
	regionEndpoint: string;
	assetsImageURL: string;
}

export const ENDANGERED_LANGUAGE_CONFIG =
	new InjectionToken<EndangeredLanguageConfig>("Endangered language config");

@Injectable()
export class EndangeredLanguageService {
	private _contextLanguages: EndangeredLanguage[] = [];
	private _allLanguages: EndangeredLanguage[] = [];
	private _allRegions: any = {};
	private _displayRegions: any = [];

	private _currentLanguage: EndangeredLanguage = {} as EndangeredLanguage;
	public get currentLanguage(): EndangeredLanguage {
		return this._currentLanguage;
	}

	public readonly currentLanguageChanged: EventEmitter<string> =
		new EventEmitter();

	public get languages(): EndangeredLanguage[] {
		return this._contextLanguages;
	}

	public get allLanguages(): EndangeredLanguage[] {
		return this._allLanguages;
	}

	public get displayRegions(): EndangeredLanguage[] {
		return this._displayRegions;
	}

	public get imageAssetsURL(): string {
		return this.config.assetsImageURL;
	}

	constructor(
		@Inject(ENDANGERED_LANGUAGE_CONFIG)
		private config: EndangeredLanguageConfig,
		private http: HttpClient,
		private i18nService: I18nService
	) {
		this._getAllLanguages().then(() => {
			const storedLanguageCode = localStorage.getItem("currentLanguage");
			if (storedLanguageCode) {
				const storedLanguage = this._contextLanguages.find(
					(lang) => lang.code === storedLanguageCode
				);
				if (storedLanguage) {
					this._currentLanguage = storedLanguage;
				}
			}
		});
		this._getRegions();
	}

	private async _getRegions() {
		const resp = await this.http
			.post<any>(this.config.regionEndpoint, {})
			.toPromise();

		this._allRegions = resp;
		this.setRegionsWithTranslations();

		this.i18nService.currentLanguageChanged.subscribe(() => {
			this.setRegionsWithTranslations();
		});
	}

	private async _getAllLanguages() {
		const _formData = new FormData();
		_formData.append("region", "all");
		const resp = await this.http
			.post<EndangeredLanguage[]>(
				this.config.endangeredLanguageEndpoint,
				_formData
			)
			.toPromise();
		this._allLanguages = resp;
		this._contextLanguages = resp;
		const defaultLanguage = resp.find((lang) => lang.default);
		this._currentLanguage = defaultLanguage || resp[0];
	}

	private setRegionsWithTranslations() {
		this._displayRegions = Object.keys(this._allRegions).map((region) => {
			return {
				code: region,
				name: this._allRegions[region][
					this.i18nService.currentLanguage.code
				],
			};
		});
	}

	public setLanguage(code: string) {
		if (
			code === this._currentLanguage?.code ||
			this._contextLanguages.length === 0
		) {
			return;
		}

		const newLanguage = this._contextLanguages.find(
			(lang) => lang.code === code
		);
		if (!newLanguage) {
			throw new Error("Language not found: " + code);
		}
		logger.log("Endangered language changed: " + code);
		this._currentLanguage = newLanguage;
		this.currentLanguageChanged.emit(this._currentLanguage.code);
		localStorage.setItem("currentLanguage", code);
	}

	public setLanguages(languages: EndangeredLanguage[]) {
		this._contextLanguages = languages;
		this._currentLanguage = languages[0];
	}
}
