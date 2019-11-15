import { AfterViewInit, Component, Inject, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Router } from '@angular/router';
import { CameraPreviewComponent, CameraPreviewStatus } from 'components/camera-preview/camera-preview';
import { CapturePopUpComponent } from 'components/capture-popup/capture-popup';
import { ErrorPopUpComponent } from 'components/error-popup/error-popup';
import { ANALYTICS_SERVICE, IAnalyticsService } from 'services/analytics';
import { I18n } from '@ngx-translate/i18n-polyfill';
import { IImageRecognitionService, IMAGE_RECOGNITION_SERVICE } from 'services/image-recognition';
import { AppRoutes } from 'app/routes';
import { LoadingPopUpComponent } from 'components/loading-popup/loading-popup';
import { SessionService } from 'services/session';
import { addOpenedListener } from 'util/dialog';
import { removeImageTransform } from 'util/image';

export class ImageLoaderPageBase {
  constructor( protected router: Router,
               protected dialog: MatDialog,
               protected sessionService: SessionService,
               @Inject(IMAGE_RECOGNITION_SERVICE) protected imageRecognitionService: IImageRecognitionService) {
  }

  onImageUploaded(image: Blob) {
    const loadingPopUp = this.dialog.open(LoadingPopUpComponent,
      { closeOnNavigation: false, disableClose: true, panelClass: 'loading-popup' });
    this.sessionService.currentSession.currentModal = loadingPopUp;
    loadingPopUp.beforeClosed().subscribe({
      complete: () => this.sessionService.currentSession.currentModal = null
    });
    addOpenedListener(loadingPopUp, () => {
      removeImageTransform(image).then(
        correctedImage => this.loadImageDescriptions(correctedImage, loadingPopUp),
        err => {
          console.warn('Error removing image rotation - defaulting to current rotation', err);
          this.loadImageDescriptions(image, loadingPopUp);
        }
      );
    });
  }

  protected loadImageDescriptions(image: Blob, loadingPopUp: MatDialogRef<CapturePopUpComponent>) {
    this.imageRecognitionService.loadDescriptions(image).then(
      (descriptions) => {
        if (descriptions.length > 0) {
          this.router.navigateByUrl(AppRoutes.Translate, { state: { image, words: descriptions.map(d => d.description) } }).then(
            (success) => {
              if (!success) {
                loadingPopUp.close();
              }
            },
            () => loadingPopUp.close()
          );
        } else {
          this.router.navigateByUrl(AppRoutes.CaptionImage, { state: { image } }).finally(
            () => loadingPopUp.close()
          );
        }
      },
      (err) => {
        console.warn('Error loading image descriptions', err);
        loadingPopUp.close();
        this.router.navigateByUrl(AppRoutes.CaptionImage, { state: { image } }).finally(
          () => loadingPopUp.close()
        );
      }
    );
  }
}

@Component({
  selector: 'app-page-capture',
  templateUrl: 'capture.html',
  styleUrls: ['./capture.scss']
})
export class CapturePageComponent extends ImageLoaderPageBase implements AfterViewInit, OnDestroy {
  @ViewChild(CameraPreviewComponent, {static: false})
  private cameraPreview: CameraPreviewComponent|null = null;
  private modalIsForCameraStartup = true;
  public captureInProgress = false;
  public sidenavOpen = false;

  constructor( router: Router,
               dialog: MatDialog,
               sessionService: SessionService,
               @Inject(IMAGE_RECOGNITION_SERVICE) imageRecognitionService: IImageRecognitionService,
               private i18n: I18n,
               @Inject(ANALYTICS_SERVICE) private analyticsService: IAnalyticsService) {
    super(router, dialog, sessionService, imageRecognitionService);
  }

  ngAfterViewInit() {
    let loadingPopUp: MatDialogRef<any>|undefined = this.sessionService.currentSession.currentModal;
    this.analyticsService.logPageView(this.router.url, 'Capture');
    if (!this.cameraPreview) {
      console.error('Camera preview not found');
      if (loadingPopUp) {
        loadingPopUp.close();
      }
      this.router.navigateByUrl(AppRoutes.ImageSource, { replaceUrl: true });
      return;
    }
    if (!loadingPopUp) {
      loadingPopUp = this.dialog.open(LoadingPopUpComponent, { disableClose: true, panelClass: 'loading-popup' });
    }
    loadingPopUp.afterClosed().subscribe({
      next: () => this.modalIsForCameraStartup = false
    });
    this.cameraPreview.start().then(
      () => {
        console.log('Camera started');
        if (loadingPopUp) {
          loadingPopUp.close();
        }
      },
      err => {
        console.warn('Error starting camera', err);
        if (loadingPopUp) {
          loadingPopUp.close();
        }
        const errorMessage = this.i18n({ id: 'startCameraError', value: 'Unable to start camera' });
        const errorDialog = this.dialog.open(ErrorPopUpComponent, { data: { message: errorMessage } });
        errorDialog.afterClosed().subscribe({ complete: () => this.router.navigateByUrl(AppRoutes.ImageSource, { replaceUrl: true }) });
      }
    );
  }

  ngOnDestroy(): void {
    const loadingPopUp: MatDialogRef<any>|undefined = this.sessionService.currentSession.currentModal;
    if (loadingPopUp && this.modalIsForCameraStartup) {
      loadingPopUp.close();
    }
  }

  onCaptureClick() {
    if (!this.cameraPreview) {
      return;
    } else if (this.cameraPreview.status !== CameraPreviewStatus.Started) {
      return;
    }
    const preview = this.cameraPreview;
    this.captureInProgress = true;
    const loadingPopUp = this.dialog.open(CapturePopUpComponent,
      { closeOnNavigation: false, disableClose: true, panelClass: 'loading-popup' });
    this.sessionService.currentSession.currentModal = loadingPopUp;
    loadingPopUp.beforeClosed().subscribe({
      complete: () => this.sessionService.currentSession.currentModal = null
    });
    addOpenedListener(loadingPopUp, () => {
      preview.capture().then(
        image => {
          console.log('Image captured');
          this.loadImageDescriptions(image, loadingPopUp);
        },
        err => {
          console.warn('Failed to capture image', err);
          this.captureInProgress = false;
          loadingPopUp.close();
          const errorMessage = this.i18n({ id: 'captureImageError', value: 'Unable to capture image' });
          this.dialog.open(ErrorPopUpComponent, { data: { message: errorMessage } });
        }
      );
    });
  }

  onSidenavOpenStart() {
    // HACK: Fix iOS Safari iPhone 7+ hiding sidenav on transition complete
    (document.getElementsByTagName('mat-sidenav')[0] as HTMLElement).style.transform = 'none';
  }

  onOpenMenuClick() {
    this.sidenavOpen = true;
  }

  onSidenavClosed() {
    this.sidenavOpen = false;
  }
}
