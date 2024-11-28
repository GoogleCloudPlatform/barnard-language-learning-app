import { NgModule } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule } from "@angular/material/dialog";
import { ErrorPopUpComponent } from "./error-popup";
import { I18nModule } from "../../i18n/i18n.module";

@NgModule({
	declarations: [ErrorPopUpComponent],
	exports: [ErrorPopUpComponent],
	imports: [MatDialogModule, MatButtonModule, I18nModule],
	// entryComponents: [ErrorPopUpComponent],
})
export class ErrorPopUpModule {}
