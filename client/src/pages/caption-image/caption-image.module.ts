import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDialogModule } from "@angular/material/dialog";
import { MatInputModule } from "@angular/material/input";
import { ServicesModule } from "../../services/services.module";
import { PipesModule } from "../../pipes/pipes.module";
import { IconComponentModule } from "../../components/icon/icon.module";
import { environment } from "../../environments/environment";
import { I18nModule } from "../../i18n/i18n.module";
import { AppToolbarModule } from "../../components/app-toolbar/app-toolbar.module";
import {
	CAPTION_IMAGE_PAGE_CONFIG,
	CaptionImagePageComponent,
} from "./caption-image";

@NgModule({
	declarations: [CaptionImagePageComponent],
	imports: [
		ServicesModule,
		PipesModule,
		IconComponentModule,
		FormsModule,
		ReactiveFormsModule,
		MatInputModule,
		MatDialogModule,
		CommonModule,
		I18nModule,
		AppToolbarModule,
	],
	providers: [
		{
			provide: CAPTION_IMAGE_PAGE_CONFIG,
			useValue: environment.pages.captionImage,
		},
	],
})
export class CaptionImagePageModule {}
