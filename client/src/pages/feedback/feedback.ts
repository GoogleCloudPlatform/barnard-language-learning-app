import { AfterViewInit, Component, Inject } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ErrorPopUpComponent } from '../../components/error-popup/error-popup';
import { ANALYTICS_SERVICE, IAnalyticsService } from '../../services/analytics';
import { FEEDBACK_SERVICE, IFeedbackService } from '../../services/feedback';
import { FeedbackType, Feedback } from '../../services/entities/feedback';
import { LoadingPopUpComponent } from '../../components/loading-popup/loading-popup';
import { environment } from '../../environments/environment';
import { I18nService } from '../../i18n/i18n.service';
import { EndangeredLanguageService } from '../../services/endangered-language';
import { DEFAULT_LOCALE } from '../../util/locale';
import { getLogger } from '../../util/logging';

const logger = getLogger('FeedbackPageComponent');

@Component({
  selector: 'app-page-feedback',
  templateUrl: './feedback.html',
  styleUrls: ['./feedback.scss']
})
export class FeedbackPageComponent implements AfterViewInit {
  public readonly feedbackForm: FormGroup;
  private readonly prevPageCssClass?: string;
  public submittingForm = false;
  public FeedbackType = FeedbackType;

  constructor(private router: Router,
    private location: Location,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private i18n: I18nService,
    private endangeredLanguageService: EndangeredLanguageService,
    @Inject(FEEDBACK_SERVICE) private feedbackService: IFeedbackService,
    @Inject(ANALYTICS_SERVICE) private analyticsService: IAnalyticsService) {
    const word = history.state.word;
    this.feedbackForm = new FormGroup({
      word: new FormControl(word ? word.original : ''),
      nativeWord: new FormControl(word ? word.translation : '', []),
      englishWord: new FormControl(word ? word.english : '', []),
      transliteration: new FormControl(word ? word.transliteration : '', []),
      suggestedTranslation: new FormControl(null, [
      ]),
      suggestedTransliteration: new FormControl(null, [
      ]),
      recording: new FormControl(null, []),
      content: new FormControl('', [
        Validators.required
      ]),
      types: new FormControl([], [
        (ctl) => ctl.dirty && (!ctl.value || ctl.value.length === 0) ? { required: true } : null
      ])
    });
    this.prevPageCssClass = history.state.prevPageCssClass;
  }

  ngAfterViewInit() {
    this.analyticsService.logPageView(this.router.url, 'Feedback');
  }

  onFormSubmit() {
    // Force validation of all fields
    for (const k of Object.keys(this.feedbackForm.controls)) {
      this.feedbackForm.controls[k].markAsDirty();
    }
    // Force types checkboxes to validate
    const typesControl = this.feedbackForm.controls.types;
    typesControl.updateValueAndValidity();
    if (!this.feedbackForm.valid) {
      return;
    }
    this.submittingForm = true;
    const loadingPopup = this.dialog.open(LoadingPopUpComponent, { panelClass: 'loading-popup' });
    const feedback: Feedback = this.feedbackForm.value;
    if (!feedback.word && this.i18n.currentLanguage.code == DEFAULT_LOCALE) {
      feedback.word = feedback.englishWord;
    }
    feedback.language = this.i18n.currentLanguage.code;
    feedback.nativeLanguage = this.endangeredLanguageService.currentLanguage.code;
    this.feedbackService.sendFeedback(feedback).then(
      () => {
        logger.log('Feedback submitted');
        this.location.back();
        const snackbarCssClass = this.prevPageCssClass ? `${this.prevPageCssClass}-snack-bar` : '';
        this.snackBar.open(this.i18n.getTranslation('feedbackSubmitted') || 'Feedback submitted', '',
          { duration: environment.components.snackBar.duration, panelClass: snackbarCssClass });
        // HACK: fix snackbar not closing on some iOS devices
        setTimeout(() => {
          (document.getElementsByTagName('snack-bar-container')[0].parentNode as Element).remove();
        }, environment.components.snackBar.duration + 500);
      },
      err => {
        logger.warn('Failed submitting feedback', err);
        const errorMessage = this.i18n.getTranslation('submitFeedbackError') || 'Unable to save feedback';
        this.dialog.open(ErrorPopUpComponent, { data: { message: errorMessage } });
      }
    ).finally(
      () => {
        this.submittingForm = false;
        loadingPopup.close();
      }
    );
  }

  typeIsSelected(type: FeedbackType): boolean {
    return this.feedbackForm.controls.types.value.indexOf(type) >= 0;
  }

  onFeedbackTypeChange(ev: MatCheckboxChange, type: FeedbackType) {
    const ctl = this.feedbackForm.controls.types;
    const types = ctl.value;
    const index = types.indexOf(type);
    if (ev.checked) {
      if (index < 0) {
        types.push(type);
      }
    } else if (index >= 0) {
      types.splice(index, 1);
    }
    ctl.markAsDirty();
    ctl.markAsTouched();
    ctl.setValue(types);
  }

  onCloseClick(ev: Event) {
    ev.stopPropagation();
    ev.preventDefault();
    history.back();
  }
}
