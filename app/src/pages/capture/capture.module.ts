import { NgModule } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { CapturePageComponent } from './capture';
import { CameraPreviewModule } from 'components/camera-preview/camera-preview.module';
import { IconComponentModule } from 'components/icon/icon.module';
import { ErrorPopUpModule } from 'components/error-popup/error-popup.module';
import { SidenavModule } from 'components/sidenav/sidenav.module';
import { FileUploadButtonModule } from 'components/file-upload-button/file-upload-button.module';
import { CapturePopUpModule } from 'components/capture-popup/capture-popup.module';

@NgModule({
  declarations: [
    CapturePageComponent,
  ],
  imports: [
    MatSidenavModule,
    IconComponentModule,
    CameraPreviewModule,
    ErrorPopUpModule,
    CapturePopUpModule,
    SidenavModule,
    FileUploadButtonModule
  ]
})
export class CapturePageModule {}
