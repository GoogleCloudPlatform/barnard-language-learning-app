import { NgModule } from "@angular/core";
import { MatDialogModule } from "@angular/material/dialog";
import { LoadingPopUpComponent } from "./loading-popup";
import { BusySpinnerModule } from "../../components/busy-spinner/busy-spinner.module";

@NgModule({
	declarations: [LoadingPopUpComponent],
	exports: [LoadingPopUpComponent],
	imports: [MatDialogModule, BusySpinnerModule],
	// entryComponents: [LoadingPopUpComponent],
})
export class LoadingPopUpModule {}
