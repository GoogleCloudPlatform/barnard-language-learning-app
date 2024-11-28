import { Pipe, PipeTransform } from "@angular/core";
import { I18nService } from "./i18n.service";
import { EndangeredLanguageService } from "../services/endangered-language";

@Pipe({ name: "translate", pure: false })
export class TranslatePipe implements PipeTransform {
	constructor(
		private i18nService: I18nService,
		private endangeredLanguage: EndangeredLanguageService
	) {}

	transform(
		text: any,
		id?: string,
		replacements?: { [index: string]: string },
		language?: string
	): string {
		if (text === "Description") {
			const language = this.endangeredLanguage.languages.find((lang) => {
				if (lang.code === id) {
					return lang.name;
				}
			});

			return (
				language?.shortDescriptions[
					this.i18nService.currentLanguage.code
				] || text
			);
		}

		const translateKey = id ? id : text;
		let translation = this.i18nService.getTranslation(
			translateKey,
			replacements
		);
		return translation || text;
	}
}
