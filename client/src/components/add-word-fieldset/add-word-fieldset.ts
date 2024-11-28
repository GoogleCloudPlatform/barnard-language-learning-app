import { Component, Inject, InjectionToken, Input, NgZone } from '@angular/core';
import { getOperatingSystem, OperatingSystem } from '../../util/platform';
import { DEFAULT_LOCALE } from '../../util/locale';
import { FormGroup } from '@angular/forms';
import { I18nService } from '../../i18n/i18n.service';
import { getLogger } from '../../util/logging';

interface AddWordFieldsetConfig {
  maxRecordingDuration: number;
  recordingBufferSize: number;
  recordingMimeTypes: string[];
  androidGBoardUrl: string;
  iosGBoardUrl: string;
  keymanUrl: string;
  progressAnimationInterval: number;
}

export const ADD_WORD_FIELDSET_CONFIG = new InjectionToken<AddWordFieldsetConfig>('Add Word Fieldset config');

enum RecordingState {
  Idle,
  Recording,
  Finished,
  Playing
}

const logger = getLogger('AddWordFieldsetComponent');

@Component({
  selector: 'app-add-word-fieldset',
  templateUrl: './add-word-fieldset.html',
  styleUrls: ['./add-word-fieldset.scss']
})
export class AddWordFieldsetComponent {
  public recordingState = RecordingState.Idle;
  public recordingStateValues = RecordingState;
  public operatingSystem: OperatingSystem;
  public operatingSystemValues = OperatingSystem;
  public gboardUrl: string;
  public keymanUrl: string;

  // only show primary language word if current language is not english
  public get primaryLanguageWordAvailable(): boolean { return this.i18n.currentLanguage.code != DEFAULT_LOCALE; }

  @Input() public formGroup: FormGroup | undefined = undefined;
  @Input() public includeRecording: boolean = true;
  @Input() public suggested: boolean = true;
  constructor(
    @Inject(ADD_WORD_FIELDSET_CONFIG) private config: AddWordFieldsetConfig,
    private zone: NgZone,
    private i18n: I18nService) {
    this.operatingSystem = getOperatingSystem();
    this.keymanUrl = this.config.keymanUrl;
    this.gboardUrl = this.operatingSystem === OperatingSystem.Android ?
      this.config.androidGBoardUrl : this.config.iosGBoardUrl;
  }
}
