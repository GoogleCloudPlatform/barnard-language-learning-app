import { Component } from "@angular/core";
import { I18nService } from "../../../i18n/i18n.service";
import {
	EndangeredLanguage,
	EndangeredLanguageService,
} from "../../../services/endangered-language";
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { AppRoutes } from "../../../app/routes";

@Component({
	selector: "app-view-language",
	templateUrl: "./view-language.html",
	styleUrls: ["./view-language.scss"],
})
export class ViewLanguagePageComponent {
	public get endangeredLanguages(): EndangeredLanguage[] {
		return this.endangeredLanguageService.languages;
	}
	public get otherLanguages(): EndangeredLanguage[] {
		const currentLang = this.language;
		if (!currentLang) {
			return this.endangeredLanguageService.languages;
		}
		return this.endangeredLanguageService.languages.filter(
			(lang) => lang.code !== currentLang.code
		);
	}

	public get languageImage(): string {
		return this.language
			? `${this.endangeredLanguageService.imageAssetsURL}${this.language.sampleWordImageURL}`
			: "";
	}

	public language: EndangeredLanguage | null;

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private i18nService: I18nService,
		private endangeredLanguageService: EndangeredLanguageService
	) {
		this.language = null;
		this.route.paramMap.subscribe((params: ParamMap) => {
			this.language =
				this.endangeredLanguageService.languages.find(
					(lang) => lang.code === params.get("id")
				) || null;
		});
	}

	onExploreLanguageClick() {
		const lang = this.language;
		if (lang) {
			window.open(lang.organizationURL);
		}
	}

	onLanguageClick(code: string) {
		window.scrollTo(0, 0);
		this.router.navigate([AppRoutes.ListLanguages, code]);
	}

	onBackClick(ev: MouseEvent) {
		ev.stopPropagation();
		history.back();
	}
	prefixImageUrl(sampleWordImageURL: string): string {
		return `${this.endangeredLanguageService.imageAssetsURL}${sampleWordImageURL}`;
	  }
}
