import { Component, Inject, InjectionToken, Input, NgZone } from '@angular/core';
import { audioRecordingIsAvailable, AudioStream, play, RecordingStream, startRecording } from 'util/audio';
import { getOperatingSystem, OperatingSystem } from 'util/platform';
import { FormGroup } from '@angular/forms';

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

@Component({
  selector: 'app-add-word-fieldset',
  templateUrl: './add-word-fieldset.html',
  styleUrls: ['./add-word-fieldset.scss']
})
export class AddWordFieldsetComponent {
  private audioStream: AudioStream|null = null;
  private recording: Blob|null = null;
  public recordingState = RecordingState.Idle;
  public recordingStateValues = RecordingState;
  public audioStreamProgress = 0;
  public operatingSystem: OperatingSystem;
  public operatingSystemValues = OperatingSystem;
  public gboardUrl: string;
  public keymanUrl: string;

  public get audioRecordingIsAvailable(): boolean { return audioRecordingIsAvailable(); }

  @Input()
  public formGroup: FormGroup|undefined = undefined;

  constructor(@Inject(ADD_WORD_FIELDSET_CONFIG) private config: AddWordFieldsetConfig,
              private zone: NgZone) {
    this.operatingSystem = getOperatingSystem();
    this.keymanUrl = this.config.keymanUrl;
    this.gboardUrl = this.operatingSystem === OperatingSystem.Android ?
      this.config.androidGBoardUrl : this.config.iosGBoardUrl;
  }

  public fieldHasError(field: string, error: string): boolean {
    if (!this.formGroup) {
      return false;
    }
    return this.formGroup.controls[field].hasError(error);
  }

  onStartRecordingClick(ev: MouseEvent) {
    ev.preventDefault();
    ev.stopPropagation();
    console.log('Starting recording');
    this.audioStreamProgress = 0;
    this.recordingState = RecordingState.Recording;
    startRecording(this.config.recordingBufferSize, this.config.recordingMimeTypes).then(
      this.onRecordingStarted,
      (err) => {
        console.warn('Error starting recording', err);
        this.zone.run(() => {
          this.recordingState = RecordingState.Idle;
        });
      }
    );
  }

  onRecordingStarted = (stream: RecordingStream) => {
    console.log('Recording started');
    this.audioStream = stream;
    const recordingTimeout = setTimeout(() => {
      stream.stop();
    }, this.config.maxRecordingDuration);
    const startTime = Date.now();
    const progressInterval = setInterval(() => {
      this.zone.run(() => {
        this.audioStreamProgress = (Date.now() - startTime) / this.config.maxRecordingDuration;
      });
    }, this.config.progressAnimationInterval);
    stream.onended = (buffer) => {
      console.log('Recording complete');
      clearTimeout(recordingTimeout);
      clearInterval(progressInterval);
      if (this.formGroup) {
        this.formGroup.controls.recording.setValue(buffer);
      }
      this.recording = buffer;
      this.audioStream = null;
      this.zone.run(() => {
        this.recordingState = RecordingState.Finished;
      });
    };
  };

  onStopRecordingClick(ev: MouseEvent) {
    ev.preventDefault();
    ev.stopPropagation();
    console.log('Stopping audio');
    if (this.audioStream) {
      this.audioStream.stop();
    }
    this.recordingState = this.recording ? RecordingState.Finished : RecordingState.Idle;
  }

  onPlayRecordingClick(ev: MouseEvent) {
    ev.preventDefault();
    ev.stopPropagation();
    console.log('Starting playback');
    if (!this.recording) {
      console.warn('No audio recorded');
      return false;
    }
    this.audioStreamProgress = 0;
    this.recordingState = RecordingState.Playing;
    play(this.recording).then(
      (stream) => {
        console.log('Playback started');
        const duration = Number.isFinite(stream.getDuration()) ? stream.getDuration() : this.config.maxRecordingDuration * 0.001;
        this.audioStream = stream;
        const progressInterval = setInterval(() => {
          this.zone.run(() => {
            this.audioStreamProgress = stream.getCurrentTime() / duration;
          });
        }, this.config.progressAnimationInterval);
        stream.onended = () => {
          console.log('Playback ended');
          clearInterval(progressInterval);
          this.zone.run(() => {
            this.recordingState = RecordingState.Finished;
          });
        };
      },
      (err) => {
        console.warn('Error playing recording', err);
        this.zone.run(() => {
          this.recordingState = RecordingState.Finished;
        });
      }
    );
  }
}
