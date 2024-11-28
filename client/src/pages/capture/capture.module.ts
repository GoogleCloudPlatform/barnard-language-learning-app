import { NgModule } from "@angular/core";
import { MatSidenavModule } from "@angular/material/sidenav";
import { AppToolbarModule } from "../../components/app-toolbar/app-toolbar.module";
import { CapturePageComponent } from "./capture";
import { CameraPreviewModule } from "../../components/camera-preview/camera-preview.module";
import { IconComponentModule } from "../../components/icon/icon.module";
import { ErrorPopUpModule } from "../../components/error-popup/error-popup.module";
import { LoadingPopUpModule } from "../../components/loading-popup/loading-popup.module";
import { SidenavModule } from "../../components/sidenav/sidenav.module";
import { CapturePopUpModule } from "../../components/capture-popup/capture-popup.module";
import { I18nModule } from "../../i18n/i18n.module";
import { DirectivesModule } from "../../directives/directives.module";
import { CommonModule } from "@angular/common";

@NgModule({
	declarations: [CapturePageComponent],
	imports: [
		CommonModule,
		MatSidenavModule,
		AppToolbarModule,
		IconComponentModule,
		CameraPreviewModule,
		ErrorPopUpModule,
		LoadingPopUpModule,
		CapturePopUpModule,
		SidenavModule,
		DirectivesModule,
		I18nModule,
	],
})
export class CapturePageModule {}
