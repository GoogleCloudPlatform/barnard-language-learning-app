import { AfterViewInit, Component, Inject, NgZone } from "@angular/core";
import { Location } from "@angular/common";
import { Router } from "@angular/router";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ErrorPopUpComponent } from "../../components/error-popup/error-popup";
import { ANALYTICS_SERVICE, IAnalyticsService } from "../../services/analytics";
import { FEEDBACK_SERVICE, IFeedbackService } from "../../services/feedback";
import { LoadingPopUpComponent } from "../../components/loading-popup/loading-popup";
import { WordTranslation } from "../../services/entities/translation";
import { environment } from "../../environments/environment";
import { DEFAULT_LOCALE } from "../../util/locale";
import { I18nService } from "../../i18n/i18n.service";
import { EndangeredLanguageService } from "../../services/endangered-language";
import { Feedback } from "../../services/entities/feedback";
import { getLogger } from "../../util/logging";

const logger = getLogger("AddWordPageComponent");

@Component({
	selector: "app-page-add-word",
	templateUrl: "./add-word.html",
	styleUrls: ["./add-word.scss"],
})
export class AddWordPageComponent implements AfterViewInit {
	public readonly form: FormGroup;
	private readonly prevPageCssClass?: string;
	public submittingForm = false;

	public get endangeredLanguage(): string {
		return this.endangeredLanguageService.currentLanguage.name;
	}

	constructor(
		private router: Router,
		private location: Location,
		private dialog: MatDialog,
		private snackBar: MatSnackBar,
		private zone: NgZone,
		private i18n: I18nService,
		private endangeredLanguageService: EndangeredLanguageService,
		@Inject(FEEDBACK_SERVICE) private feedbackService: IFeedbackService,
		@Inject(ANALYTICS_SERVICE) private analyticsService: IAnalyticsService
	) {
		const word: WordTranslation = history.state.word;
		this.form = new FormGroup({
			word: new FormControl(
				word ? word.translations[0].original : "",
				this.i18n.currentLanguage.code !== DEFAULT_LOCALE
					? [Validators.required]
					: []
			),
			nativeWord: new FormControl(
				word ? word.translations[0].translation : "",
				[]
			),
			englishWord: new FormControl(word ? word.english : "", [
				Validators.required,
			]),
			transliteration: new FormControl(
				word ? word.translations[0].translation : "",
				[]
			),
			suggestedTranslation: new FormControl(null, []),
			suggestedTransliteration: new FormControl(null, []),
			recording: new FormControl(null, []),
			types: new FormControl(
				["suggested"],
				[
					(ctl) =>
						ctl.dirty && (!ctl.value || ctl.value.length === 0)
							? { required: true }
							: null,
				]
			),
		});
		this.prevPageCssClass = history.state.prevPageCssClass;
	}

	ngAfterViewInit() {
		this.analyticsService.logPageView(this.router.url, "Add word");
	}

	onFormSubmit() {
		// Force validation of all fields
		for (const k of Object.keys(this.form.controls)) {
			this.form.controls[k].markAsDirty();
		}
		if (!this.form.valid) {
			return;
		}
		this.submittingForm = true;
		const loadingPopup = this.dialog.open(LoadingPopUpComponent, {
			panelClass: "loading-popup",
		});
		const feedback: Feedback = this.form.value;
		if (
			!feedback.word &&
			this.i18n.currentLanguage.code == DEFAULT_LOCALE
		) {
			feedback.word = feedback.englishWord;
		}
		feedback.language = this.i18n.currentLanguage.code;
		feedback.nativeLanguage =
			this.endangeredLanguageService.currentLanguage.code;
		this.feedbackService
			.sendFeedback(this.form.value)
			.then(
				() => {
					logger.log("Added word submitted");
					this.location.back();
					const snackbarCssClass = this.prevPageCssClass
						? `${this.prevPageCssClass}-snack-bar`
						: "";
					this.snackBar.open(
						this.i18n.getTranslation("wordSubmitted") ||
							"Submitted for review",
						"",
						{
							duration: environment.components.snackBar.duration,
							panelClass: snackbarCssClass,
						}
					);
					// HACK: fix snackbar not closing on some iOS devices
					setTimeout(() => {
						(
							document.getElementsByTagName(
								"snack-bar-container"
							)[0].parentNode as Element
						).remove();
					}, environment.components.snackBar.duration + 500);
				},
				(err) => {

					logger.warn("Failed adding word", err);
					const errorMessage =
						this.i18n.getTranslation("sendFeedbackError") ||
						"Unable to add word";
					this.dialog.open(ErrorPopUpComponent, {
						data: { message: errorMessage },
					});
				}
			)
			.finally(() => {
				this.submittingForm = false;
				loadingPopup.close();
			});
	}

	onCloseClick(ev: Event) {
		ev.preventDefault();
		ev.stopPropagation();
		history.back();
	}
}
