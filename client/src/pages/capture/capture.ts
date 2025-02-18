import {
	AfterViewInit,
	Component,
	Inject,
	OnDestroy,
	ViewChild,
} from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { Router } from "@angular/router";
import {
	CameraPreviewComponent,
	CameraPreviewStatus,
} from "../../components/camera-preview/camera-preview";
import { CapturePopUpComponent } from "../../components/capture-popup/capture-popup";
import { ErrorPopUpComponent } from "../../components/error-popup/error-popup";
import { ANALYTICS_SERVICE, IAnalyticsService } from "../../services/analytics";
import {
	IImageRecognitionService,
	IMAGE_RECOGNITION_SERVICE,
} from "../../services/image-recognition";
import { AppRoutes } from "../../app/routes";
import { LoadingPopUpComponent } from "../../components/loading-popup/loading-popup";
import { SessionService } from "../../services/session";
import { addOpenedListener } from "../../util/dialog";
import { I18nService } from "../../i18n/i18n.service";
import { IProfileService, PROFILE_SERVICE } from "../../services/profile";
import { getLogger } from "../../util/logging";

const logger = getLogger("CapturePageComponent");

export class ImageLoaderPageBase {
	constructor(
		protected router: Router,
		protected i18n: I18nService,
		protected dialog: MatDialog,
		protected sessionService: SessionService,
		@Inject(IMAGE_RECOGNITION_SERVICE)
		protected imageRecognitionService: IImageRecognitionService
	) {}

	onImageUploaded(image: Blob) {
		const loadingPopUp = this.dialog.open(LoadingPopUpComponent, {
			closeOnNavigation: false,
			disableClose: true,
			panelClass: "loading-popup",
		});
		this.sessionService.currentSession.currentModal = loadingPopUp;
		loadingPopUp.beforeClosed().subscribe({
			complete: () =>
				(this.sessionService.currentSession.currentModal = null),
		});
		addOpenedListener(loadingPopUp, () =>
			this.loadImageDescriptions(image, loadingPopUp)
		);
	}

	protected loadImageDescriptions(
		image: Blob,
		loadingPopUp: MatDialogRef<CapturePopUpComponent>
	) {
		this.imageRecognitionService.loadDescriptions(image).then(
			(descriptions) => {
				if (descriptions.length > 0) {
					this.router
						.navigateByUrl(AppRoutes.Translate, {
							state: {
								image,
								imageURL: URL.createObjectURL(image),
								words: descriptions.map((d) => d.description),
							},
						})
						.then(
							(success) => {
								if (!success) {
									loadingPopUp.close();
								}
							},
							() => loadingPopUp.close()
						);
				} else {
					this.router
						.navigateByUrl(AppRoutes.CaptionImage, {
							state: {
								image,
								imageURL: URL.createObjectURL(image),
							},
						})
						.finally(() => loadingPopUp.close());
				}
			},
			(err) => {
				logger.warn("Error loading image descriptions", err);
				loadingPopUp.close();
				const errorTitle =
					this.i18n.getTranslation("imageRecognitionErrorTitle") ||
					"Unable to connect";
				const errorMessage =
					this.i18n.getTranslation("imageRecognitionErrorMessage") ||
					"Please check network connection";
				this.dialog.open(ErrorPopUpComponent, {
					data: { message: errorMessage, title: errorTitle },
				});
				this.router.navigateByUrl(AppRoutes.CaptionImage, {
					state: { image, imageURL: URL.createObjectURL(image) },
				});
			}
		);
	}
}

@Component({
	selector: "app-page-capture",
	templateUrl: "capture.html",
	styleUrls: ["./capture.scss"],
})
export class CapturePageComponent
	extends ImageLoaderPageBase
	implements AfterViewInit, OnDestroy
{
	@ViewChild(CameraPreviewComponent)
	private cameraPreview: CameraPreviewComponent | null = null;
	private modalIsForCameraStartup = true;
	public captureInProgress = false;
	public sidenavOpen = false;

	constructor(
		router: Router,
		dialog: MatDialog,
		sessionService: SessionService,
		i18n: I18nService,
		@Inject(PROFILE_SERVICE) private profileService: IProfileService,
		@Inject(IMAGE_RECOGNITION_SERVICE)
		imageRecognitionService: IImageRecognitionService,
		@Inject(ANALYTICS_SERVICE) private analyticsService: IAnalyticsService
	) {
		super(router, i18n, dialog, sessionService, imageRecognitionService);
	}

	ngAfterViewInit() {
		let loadingPopUp: MatDialogRef<any> | undefined =
			this.sessionService.currentSession.currentModal;
		this.analyticsService.logPageView(this.router.url, "Capture");
		if (!this.cameraPreview) {
			logger.error("Camera preview not found");
			if (loadingPopUp) {
				loadingPopUp.close();
			}
			this.router.navigateByUrl(AppRoutes.ImageSource, {
				replaceUrl: true,
			});
			return;
		}
		if (!loadingPopUp) {
			loadingPopUp = this.dialog.open(LoadingPopUpComponent, {
				disableClose: true,
				panelClass: "loading-popup",
			});
		}
		loadingPopUp.afterClosed().subscribe({
			next: () => (this.modalIsForCameraStartup = false),
		});
		this.cameraPreview.start().then(
			() => {
				logger.log("Camera started");
				if (loadingPopUp) {
					loadingPopUp.close();
				}
			},
			(err) => {
				logger.warn("Error starting camera", err);
				if (loadingPopUp) {
					loadingPopUp.close();
				}
				const errorMessage =
					this.i18n.getTranslation("startCameraError") ||
					"Camera access denied. To proceed, please enable camera permissions in your browser settings.";
				const errorDialog = this.dialog.open(ErrorPopUpComponent, {
					data: { message: errorMessage },
					panelClass: "capture-camera-error",
				});
				errorDialog.afterClosed().subscribe({
					complete: () =>
						this.router.navigateByUrl(AppRoutes.ImageSource, {
							replaceUrl: true,
						}),
				});
			}
		);
	}

	ngOnDestroy(): void {
		const loadingPopUp: MatDialogRef<any> | undefined =
			this.sessionService.currentSession.currentModal;
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
		const loadingPopUp = this.dialog.open(CapturePopUpComponent, {
			closeOnNavigation: false,
			disableClose: true,
			panelClass: "loading-popup",
		});
		this.sessionService.currentSession.currentModal = loadingPopUp;
		loadingPopUp.beforeClosed().subscribe({
			complete: () =>
				(this.sessionService.currentSession.currentModal = null),
		});
		addOpenedListener(loadingPopUp, () => {
			preview.capture().then(
				(image) => {
					logger.log("Image captured");
					this.loadImageDescriptions(image, loadingPopUp);
				},
				(err) => {
					logger.warn("Failed to capture image", err);
					this.captureInProgress = false;
					loadingPopUp.close();
					const errorMessage =
						this.i18n.getTranslation("captureImageError") ||
						"Unable to capture image";
					this.dialog.open(ErrorPopUpComponent, {
						data: { message: errorMessage },
					});
				}
			);
		});
	}

	onSidenavOpenStart() {
		// HACK: Fix iOS Safari iPhone 7+ hiding sidenav on transition complete
		(
			document.getElementsByTagName("mat-sidenav")[0] as HTMLElement
		).style.transform = "none";
	}

	onOpenMenuClick() {
		this.sidenavOpen = true;
	}

	onSidenavClosed() {
		this.sidenavOpen = false;
	}

	onChangeLanguageClick() {
		this.router.navigateByUrl(AppRoutes.ChangeLanguage);
	}
}
