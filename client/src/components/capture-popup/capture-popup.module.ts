import { NgModule } from "@angular/core";
import { MatDialogModule } from "@angular/material/dialog";
import { CapturePopUpComponent } from "./capture-popup";
import { BusySpinnerModule } from "../../components/busy-spinner/busy-spinner.module";

@NgModule({
	declarations: [CapturePopUpComponent],
	exports: [CapturePopUpComponent],
	imports: [MatDialogModule, BusySpinnerModule],
	// entryComponents: [CapturePopUpComponent],
})
export class CapturePopUpModule {}
