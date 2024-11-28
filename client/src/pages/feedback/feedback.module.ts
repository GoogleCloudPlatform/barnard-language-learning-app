import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import {
	ErrorStateMatcher,
	ShowOnDirtyErrorStateMatcher,
} from "@angular/material/core";
import { MatInputModule } from "@angular/material/input";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatToolbarModule } from "@angular/material/toolbar";
import { LoadingPopUpModule } from "../../components/loading-popup/loading-popup.module";
import { IconComponentModule } from "../../components/icon/icon.module";
import { ErrorPopUpModule } from "../../components/error-popup/error-popup.module";
import { AddWordFieldsetModule } from "../../components/add-word-fieldset/add-word-fieldset.module";
import { I18nModule } from "../../i18n/i18n.module";
import { FeedbackPageComponent } from "./feedback";

@NgModule({
	declarations: [FeedbackPageComponent],
	providers: [
		{ provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher },
	],
	imports: [
		CommonModule,
		MatToolbarModule,
		MatButtonModule,
		MatCheckboxModule,
		MatInputModule,
		MatSnackBarModule,
		FormsModule,
		ReactiveFormsModule,
		LoadingPopUpModule,
		IconComponentModule,
		AddWordFieldsetModule,
		ErrorPopUpModule,
		I18nModule,
	],
})
export class FeedbackPageModule {}
