import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatSelectModule } from "@angular/material/select";
import { I18nModule } from "../../i18n/i18n.module";
import { LanguageSelectorComponent } from "./language-selector";

@NgModule({
	declarations: [LanguageSelectorComponent],
	exports: [LanguageSelectorComponent],
	imports: [CommonModule, MatSelectModule, I18nModule],
})
export class LanguageSelectorModule {}
