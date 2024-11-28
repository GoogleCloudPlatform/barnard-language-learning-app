import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import {
	ErrorStateMatcher,
	ShowOnDirtyErrorStateMatcher,
} from "@angular/material/core";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatToolbarModule } from "@angular/material/toolbar";
import { LoadingPopUpModule } from "../../components/loading-popup/loading-popup.module";
import { IconComponentModule } from "../../components/icon/icon.module";
import { AddWordFieldsetModule } from "../../components/add-word-fieldset/add-word-fieldset.module";
import { AddWordPageComponent } from "./add-word";
import { I18nModule } from "../../i18n/i18n.module";

@NgModule({
	declarations: [AddWordPageComponent],
	providers: [
		{ provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher },
	],
	imports: [
		CommonModule,
		MatToolbarModule,
		MatButtonModule,
		MatInputModule,
		MatSnackBarModule,
		MatFormFieldModule,
		FormsModule,
		ReactiveFormsModule,
		LoadingPopUpModule,
		IconComponentModule,
		AddWordFieldsetModule,
		I18nModule,
	],
})
export class AddWordPageModule {}
