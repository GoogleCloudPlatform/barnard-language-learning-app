import { Component } from "@angular/core";
import { I18nService, Language } from "../../i18n/i18n.service";
import {
	EndangeredLanguageService,
	EndangeredLanguage,
} from "../../services/endangered-language";

@Component({
	selector: "language-selector",
	templateUrl: "./language-selector.html",
	styleUrls: ["./language-selector.scss"],
})
export class LanguageSelectorComponent {
	public get languages(): Language[] {
		return this.i18n.languages;
	}
	public get currentLanguage(): string {
		return this.i18n.currentLanguage.code;
	}
	public set currentLanguage(code: string) {
		this.i18n.setLanguage(code);
	}

	public get endangeredLanguages(): EndangeredLanguage[] {
		return this.endangeredLanguageService.languages;
	}
	public get currentEndangeredLanguage(): string {
		return this.endangeredLanguageService.currentLanguage.code;
	}
	public set currentEndangeredLanguage(code: string) {
		this.endangeredLanguageService.setLanguage(code);
	}

	constructor(
		private i18n: I18nService,
		private endangeredLanguageService: EndangeredLanguageService
	) {}
}
