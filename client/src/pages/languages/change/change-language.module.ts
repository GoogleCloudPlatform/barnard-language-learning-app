import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { CommonModule } from "@angular/common";
import { I18nModule } from "../../../i18n/i18n.module";
import { ChangeLanguagePageComponent } from "./change-language";
import { IconComponentModule } from "../../../components/icon/icon.module";
import { CameraPreviewModule } from "../../../components/camera-preview/camera-preview.module";
import { ScrollListModule } from "../../../components/scroll-list/scroll-list.module";
import { LanguageFilterModule } from "../../../components/language-filter/language-filter.module";
import { PipesModule } from "../../../pipes/pipes.module";

@NgModule({
	declarations: [ChangeLanguagePageComponent],
	exports: [ChangeLanguagePageComponent],
	imports: [
		RouterModule,
		MatButtonModule,
		CommonModule,
		I18nModule,
		IconComponentModule,
		CameraPreviewModule,
		ScrollListModule,
		LanguageFilterModule,
		PipesModule,
	],
})
export class ChangeLanguageModule {}
