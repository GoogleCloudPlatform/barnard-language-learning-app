import {
	Component,
	ElementRef,
	EventEmitter,
	Inject,
	Input,
	Output,
	ViewChild,
} from "@angular/core";
import {
	Translation,
	WordTranslation,
} from "../../services/entities/translation";
import { Point } from "../../util/geometry";
import { getLogger } from "../../util/logging";

enum AudioState {
	Stopped,
	Loading,
	Playing,
}

const logger = getLogger("TranslationSelectorComponent");

@Component({
	selector: "app-translation-selector",
	templateUrl: "./translation-selector.html",
	styleUrls: ["./translation-selector.scss"],
})
export class TranslationSelectorComponent {
	@Input()
	public translations: WordTranslation[] | null = null;
	@Output()
	public wordShared: EventEmitter<{
		word: WordTranslation;
		translation: string;
	}> = new EventEmitter<{ word: WordTranslation; translation: string }>();
	@Output()
	public addRecording: EventEmitter<WordTranslation> =
		new EventEmitter<WordTranslation>();
	@Output()
	public addTranslation: EventEmitter<WordTranslation> =
		new EventEmitter<WordTranslation>();
	@Output()
	public selectedWordChanged: EventEmitter<{
		index: number;
		word: WordTranslation | null;
		translation: string;
	}> = new EventEmitter<{
		index: number;
		word: WordTranslation | null;
		translation: string;
	}>();
	@Output()
	public manualEntrySelected: EventEmitter<any> = new EventEmitter();

	@ViewChild("audioPlayer")
	public audioPlayer: ElementRef | null = null;

	public audioStateValues = AudioState;
	public audioState: AudioState = AudioState.Stopped;
	public lineTargetPosition: Point | null = null;

	onKeyDown(event: KeyboardEvent): void {
		if (event.key === "Enter") {
			this.onAddTranslationClick();
		}
	}

	public selectedTranslation: string | null = null;

	public selectedWordVisible = false;
	public selectedWord: WordTranslation | null = null;
	@Input()
	public defaultSelectedWordIndex = -1;

	public get displayTranslation(): Translation | null {
		if (!this.translations || !this.selectedWord) {
			return null;
		}

		if (!this.selectedTranslation) {
			return this.selectedWord?.translations[0];
		}

		return (
			this.selectedWord?.translations.find(
				(t) => t.translation === this.selectedTranslation
			) || null
		);
	}

	private _translationIndex = 0;
	public get translationIndex(): number {
		return this._translationIndex;
	}

	constructor() {}

	onPlayAudioClick() {
		if (!this.audioPlayer || !this.audioPlayer.nativeElement) {
			logger.warn("Audio player not initialized");
			return;
		}
		const audioPlayer = this.audioPlayer.nativeElement as HTMLAudioElement;
		switch (this.audioState) {
			case AudioState.Stopped:
				this.audioState = AudioState.Loading;
				audioPlayer.play().then(
					() => logger.log("Audio started"),
					(err) =>
						logger.warn("Unable to start audio: " + err.toString())
				);
				break;
			default:
				audioPlayer.pause();
				audioPlayer.currentTime = 0;
				break;
		}
	}

	onAudioPlaying() {
		logger.log("Audio playing");
		this.audioState = AudioState.Playing;
	}

	onAudioStopped() {
		logger.log("Audio stopped");
		this.audioState = AudioState.Stopped;
	}

	onSelectedWordChanged(ev: { index: number; word: WordTranslation | null }) {
		this.selectedTranslation = null;
		if (this.audioState !== AudioState.Stopped) {
			this.audioState = AudioState.Stopped;
			const audioPlayer = this.audioPlayer
				? (this.audioPlayer.nativeElement as HTMLAudioElement)
				: null;
			if (audioPlayer) {
				audioPlayer.pause();
				audioPlayer.currentTime = 0;
			}
		}
		// will be fired immediately after "translations" is set, so need to delay changing
		// state again by a frame to avoid "expression changed after it was checked" error
		setTimeout(() => {
			this.selectedWordVisible = !!ev.word;
			// don't set selectedWord to null - we don't want to immediately hide translation, but transition out
			if (ev.word) {
				this.selectedWord = ev.word;

				this.selectedTranslation = ev.word.translations[0]?.translation;
				this.selectedWordChanged.emit({
					...ev,
					translation: ev.word.translations[0]?.translation,
				});
			}
		}, 1);

		if (!this.selectedTranslation) {
			return;
		}

		this.selectedWordChanged.emit({
			...ev,
			translation: this.selectedTranslation,
		});
	}

	onTargetPositionChanged(position: Point) {
		// will be fired immediately after "translations" is set, so need to delay changing
		// state again by a frame to avoid "expression changed after it was checked" error
		setTimeout(() => (this.lineTargetPosition = position), 1);
	}

	onAddRecordingClick() {
		if (this.selectedWordVisible && this.selectedWord) {
			this.addRecording.emit(this.selectedWord);
		}
	}

	onAddTranslationClick() {
		if (this.selectedWordVisible && this.selectedWord) {
			this.addTranslation.emit(this.selectedWord);
		}
	}

	onManualEntrySelected() {
		this.manualEntrySelected.emit();
	}

	onShareClick() {
		if (
			this.selectedWordVisible &&
			this.selectedWord &&
			this.selectedTranslation
		) {
			this.wordShared.emit({
				word: this.selectedWord,
				translation: this.selectedTranslation,
			});
		}
	}

	onTranslationSelectionChange(ev: number) {
		this.selectedTranslation = this.selectedWord?.translations[ev]
			?.translation as string | null;
		this.selectedWordChanged.emit({
			index: undefined as unknown as number,
			word: this.selectedWord,
			translation: this.selectedTranslation as string,
		});
	}

	trackTrans(index: number, trans: Translation) {
		return trans.translation + index;
	}
}
