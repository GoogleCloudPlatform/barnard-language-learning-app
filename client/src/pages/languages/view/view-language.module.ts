import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { I18nModule } from "../../../i18n/i18n.module";
import { ViewLanguagePageComponent } from "./view-language";
import { ScrollListModule } from "../../../components/scroll-list/scroll-list.module";
import { IconComponentModule } from "../../../components/icon/icon.module";

@NgModule({
	declarations: [ViewLanguagePageComponent],
	exports: [ViewLanguagePageComponent],
	imports: [
		RouterModule,
		CommonModule,
		I18nModule,
		ScrollListModule,
		IconComponentModule,
	],
})
export class ViewLanguageModule {}
