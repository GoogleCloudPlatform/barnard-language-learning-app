import {
	AfterViewChecked,
	Component,
	ElementRef,
	EventEmitter,
	HostListener,
	Inject,
	InjectionToken,
	Input,
	Output,
	ViewChild,
} from "@angular/core";
import { WordTranslation } from "../../services/entities/translation";
import { Point } from "../../util/geometry";

interface WordScrollListConfig {
	animationInterval: number;
	snapMinSpeed: number;
	snapMaxSpeed: number;
	snapAcceleration: number;
	snapDecelerationDistance: number;
	snapStickyDistance: number;
	targetPositionRatio: number;
	draggingMinDistance: number;
}

interface DragInfo {
	interval: any;
	offsetX: number;
	velocityX: number;
	startTime: number;
	lastClientX: number;
	lastClientY: number;
	minScrollPosition: number;
	maxScrollPosition: number;
	startScrollPosition: number;
}

export const WORD_SCROLL_LIST_CONFIG = new InjectionToken<WordScrollListConfig>(
	"Word Scroll List config"
);

@Component({
	selector: "app-word-scroll-list",
	templateUrl: "./word-scroll-list.html",
	styleUrls: ["./word-scroll-list.scss"],
})
export class WordScrollListComponent implements AfterViewChecked {
	private dragInfo: DragInfo | null = null;
	private snapInterval: any = null;
	@Output()
	public targetPositionChanged: EventEmitter<Point> = new EventEmitter();
	@Output()
	public selectedWordChanged: EventEmitter<{
		index: number;
		word: WordTranslation | null;
	}> = new EventEmitter();

	private translationsChanged = false;
	private _translations: WordTranslation[] | null = null;
	public get translations(): WordTranslation[] | null {
		return this._translations;
	}
	@Input("translations")
	public set translations(value: WordTranslation[] | null) {
		this._translations = value;
		this.translationsChanged = true;
		if (this._translations) {
			if (this._defaultSelectedWordIndex < 0) {
				this.selectedWordIndex = Math.floor(
					(this._translations.length - 1) / 2
				); // select center word (or left of center if even number)
			} else {
				this.selectedWordIndex = this._defaultSelectedWordIndex;
			}
		}
	}

	private get minScrollPosition(): number {
		const scrollContainer = this.hostElement.nativeElement as HTMLElement;
		const scrollContent = this.scrollContent?.nativeElement;
		if (!scrollContent || !scrollContainer) {
			return 0;
		}
		const childNodes = scrollContent.getElementsByTagName("li");
		const firstChild = childNodes[0];
		const lastChild = childNodes[childNodes.length - 1];
		const contentWidth =
			lastChild.offsetLeft +
			lastChild.offsetWidth -
			firstChild.offsetLeft;
		return scrollContainer.clientWidth - contentWidth;
	}

	public get isDragging(): boolean {
		return (
			!!this.dragInfo &&
			(Math.abs(
				this.dragInfo.maxScrollPosition -
					this.dragInfo.startScrollPosition
			) > this.config.draggingMinDistance ||
				Math.abs(
					this.dragInfo.minScrollPosition -
						this.dragInfo.startScrollPosition
				) > this.config.draggingMinDistance)
		);
	}

	public get isSnappingToWord(): boolean {
		return !!this.snapInterval;
	}

	private _selectedWordIndex = -1;
	public get selectedWordIndex(): number {
		return this._selectedWordIndex;
	}
	public set selectedWordIndex(value: number) {
		if (value === this._selectedWordIndex) {
			return;
		}
		this._selectedWordIndex = value;
		const selectedWord =
			this._translations && value >= 0 ? this._translations[value] : null;
		this.selectedWordChanged.emit({ index: value, word: selectedWord });
		this.updateTargetPosition();
	}

	private _defaultSelectedWordIndex = -1;
	public get defaultSelectedWordIndex(): number {
		return this._defaultSelectedWordIndex;
	}
	@Input("defaultSelectedWordIndex")
	public set defaultSelectedWordIndex(value: number) {
		if (value === this._defaultSelectedWordIndex) {
			return;
		}
		this._defaultSelectedWordIndex = value;
		if (this.translations && this._selectedWordIndex < 0) {
			this._selectedWordIndex = this._defaultSelectedWordIndex;
		}
	}

	@ViewChild("scrollContent", { static: true })
	public scrollContent: ElementRef | null = null;

	constructor(
		@Inject(WORD_SCROLL_LIST_CONFIG) private config: WordScrollListConfig,
		private hostElement: ElementRef
	) {}

	private static getTime(): number {
		return Date.now();
	}

	ngAfterViewChecked() {
		if (this.translationsChanged) {
			this.centerWords();
			this.translationsChanged = false;
		}
	}

	startDrag(x: number, y: number) {
		if (this.snapInterval) {
			clearInterval(this.snapInterval);
			this.snapInterval = null;
		}
		if (this.dragInfo && this.dragInfo.interval) {
			clearInterval(this.dragInfo.interval);
		}
		const positionX = this.getScrollPosition();
		const properties = {
			position: positionX,
			time: WordScrollListComponent.getTime(),
		};
		this.dragInfo = {
			velocityX: 0,
			offsetX: positionX - x,
			interval: setInterval(
				() => this.updateScrollVelocity(properties),
				this.config.animationInterval
			),
			startScrollPosition: positionX,
			minScrollPosition: positionX,
			maxScrollPosition: positionX,
			lastClientX: x,
			lastClientY: y,
			startTime: Date.now(),
		};
	}

	stopDrag() {
		if (!this.dragInfo) {
			return;
		}
		if (this.dragInfo.interval) {
			clearInterval(this.dragInfo.interval);
		}
		if (this.isDragging) {
			const velocity = this.dragInfo.velocityX;
			this.dragInfo = null;
			const snapWordIndex = this.getEndingSnapWordIndex(
				this.getScrollPosition(),
				velocity
			);
			this.scrollToWord(snapWordIndex, velocity);
			this.updateTargetPosition();
		} else {
			const wordIndex = this.getWordIndexFromPosition(
				this.dragInfo.lastClientX,
				this.dragInfo.lastClientY
			);
			this.dragInfo = null;
			if (
				wordIndex >= 0 &&
				this._translations &&
				wordIndex < this._translations.length
			) {
				this.scrollToWord(wordIndex);
			}
		}
	}

	updateDrag(x: number, y: number) {
		if (!this.dragInfo) {
			return;
		}
		const scrollPosition = x + this.dragInfo.offsetX;
		this.dragInfo.minScrollPosition = Math.min(
			this.dragInfo.minScrollPosition,
			scrollPosition
		);
		this.dragInfo.maxScrollPosition = Math.max(
			this.dragInfo.maxScrollPosition,
			scrollPosition
		);
		this.dragInfo.lastClientX = x;
		this.dragInfo.lastClientY = y;
		this.setScrollPosition(scrollPosition);
		this.selectedWordIndex = this.getWordIndexFromScrollPosition(
			scrollPosition,
			this.selectedWordIndex
		);
		this.updateTargetPosition();
	}

	@HostListener("touchstart", ["$event"])
	onTouchStart(ev: TouchEvent) {
		window.document.body.addEventListener("touchmove", this.onTouchMove);
		window.document.body.addEventListener("touchend", this.onTouchEnd);
		const touch = ev.touches[0];
		this.startDrag(touch.clientX, touch.clientY);
	}

	@HostListener("mousedown", ["$event"])
	onMouseDown(ev: MouseEvent) {
		ev.stopPropagation();
		ev.preventDefault();
		window.document.body.addEventListener("mousemove", this.onMouseMove);
		window.document.body.addEventListener("mouseup", this.onMouseUp);
		this.startDrag(ev.clientX, ev.clientY);
	}

	onTouchEnd = () => {
		window.document.body.removeEventListener("touchmove", this.onTouchMove);
		window.document.body.removeEventListener("touchend", this.onTouchEnd);
		this.stopDrag();
	};

	onMouseUp = () => {
		window.document.body.removeEventListener("mousemove", this.onMouseMove);
		window.document.body.removeEventListener("mouseup", this.onMouseUp);
		this.stopDrag();
	};

	onTouchMove = (ev: TouchEvent) => {
		const touch = ev.touches[0];
		this.updateDrag(touch.clientX, touch.clientY);
	};

	onMouseMove = (ev: MouseEvent) => {
		this.updateDrag(ev.clientX, ev.clientY);
	};

	private centerWords() {
		if (!this.scrollContent || this.selectedWordIndex < 0) {
			return;
		}
		const scrollContainer = this.hostElement.nativeElement as HTMLElement;
		const scrollContent = this.scrollContent.nativeElement;
		const items = scrollContent.getElementsByTagName("li");
		if (!items || this.selectedWordIndex >= items.length) {
			return;
		}
		const containerBounds = scrollContainer.getBoundingClientRect();
		const centerX = containerBounds.left + containerBounds.width * 0.5;
		const currentItem = items[this.selectedWordIndex];
		const currentItemBounds = currentItem.getBoundingClientRect();
		const currentItemCenterX =
			currentItemBounds.left + currentItemBounds.width * 0.5;
		this.setScrollPosition(centerX - currentItemCenterX);
	}

	// predict where snap position will be after decelerating
	private getEndingSnapWordIndex(position: number, velocity: number): number {
		if (Math.abs(velocity) > this.config.snapMaxSpeed) {
			// over max speed
			velocity = Math.sign(velocity) * this.config.snapMaxSpeed;
		}
		const dt = this.config.animationInterval;
		const decelerationTime =
			dt *
			Math.ceil(Math.abs(velocity / this.config.snapAcceleration) / dt);
		const finalPosition = position + 0.5 * velocity * decelerationTime;
		return this.getWordIndexFromScrollPosition(
			finalPosition,
			this.selectedWordIndex
		);
	}

	private getWordSnapPosition(index: number): number {
		if (!this.scrollContent) {
			return 0;
		}
		const scrollContainer = this.hostElement.nativeElement;
		const scrollContent = this.scrollContent.nativeElement;
		const scrollCenterX = scrollContainer.clientWidth * 0.5;
		const centerElement = scrollContent.getElementsByTagName("li")[index];
		const centerElementCenterX =
			centerElement.offsetLeft + centerElement.clientWidth * 0.5;
		return scrollCenterX - centerElementCenterX;
	}

	private getWordIndexFromScrollPosition(
		scrollPosition: number,
		currentIndex: number = -1
	): number {
		if (!this.scrollContent) {
			return 0;
		}
		const scrollContainer = this.hostElement.nativeElement;
		const scrollContent = this.scrollContent.nativeElement;
		const centerPosition =
			-scrollPosition + scrollContainer.clientWidth * 0.5;
		let nearestOffsetX = 0;
		let nearestIndex = -1;
		const items = scrollContent.getElementsByTagName("li");
		for (let k = 0; k < items.length; k++) {
			const child = items[k];
			let childLeft = child.offsetLeft;
			let childRight = child.offsetLeft + child.clientWidth;
			if (k === currentIndex) {
				childLeft -= this.config.snapStickyDistance;
				childRight += this.config.snapStickyDistance;
			}
			if (centerPosition >= childLeft && centerPosition <= childRight) {
				// center position is within child bounds
				nearestIndex = k;
				break;
			}
			const childCenterX = child.offsetLeft + child.clientWidth * 0.5;
			const childOffsetX = centerPosition - childCenterX;
			if (
				nearestIndex < 0 ||
				Math.abs(childOffsetX) < Math.abs(nearestOffsetX)
			) {
				nearestIndex = k;
				nearestOffsetX = childOffsetX;
			}
		}
		return nearestIndex;
	}

	private getWordIndexFromPosition(x: number, y: number): number {
		if (!this.scrollContent) {
			return 0;
		}
		const scrollContent = this.scrollContent.nativeElement;
		const items = scrollContent.getElementsByTagName("li");
		for (let k = 0; k < items.length; k++) {
			const child = items[k];
			let childRect = child.getBoundingClientRect();
			if (
				x >= childRect.left &&
				x <= childRect.right &&
				y >= childRect.top &&
				y <= childRect.bottom
			) {
				// position is within child bounds
				return k;
			}
		}
		return -1;
	}

	private updateScrollVelocity(lastProperties: {
		position: number;
		time: number;
	}) {
		const positionX = this.getScrollPosition();
		const dx = positionX - lastProperties.position;
		const t = WordScrollListComponent.getTime();
		const dt = t - lastProperties.time;
		if (this.dragInfo) {
			this.dragInfo.velocityX = dx / dt;
		}
		lastProperties.position = positionX;
		lastProperties.time = t;
	}

	private updateTargetPosition() {
		if (!this.scrollContent || this.selectedWordIndex < 0) {
			return;
		}
		const scrollContainer = this.hostElement.nativeElement as HTMLElement;
		const scrollContent = this.scrollContent.nativeElement;
		const items = scrollContent.getElementsByTagName("li");
		if (!items) {
			return;
		}
		const wordIndex = Math.min(this.selectedWordIndex, items.length - 1);
		if (wordIndex < 0) {
			return;
		}
		const containerBounds = scrollContainer.getBoundingClientRect();
		const centerX = containerBounds.left + containerBounds.width * 0.5;
		const currentItem = items[wordIndex];
		const currentItemBounds = currentItem.getBoundingClientRect();
		const currentItemCenterX =
			currentItemBounds.left + currentItemBounds.width * 0.5;
		const dx = centerX - currentItemCenterX;
		let maxSnapDx = currentItemBounds.width * 0.5; // max distance before snapping to next element
		let adjacentItem = null;
		if (dx < 0 && wordIndex > 0) {
			adjacentItem = items[wordIndex - 1];
		} else if (dx > 0 && wordIndex < items.length - 1) {
			adjacentItem = items[wordIndex + 1];
		}
		if (adjacentItem) {
			// has adjacent item - adjust max snap distance to point between the items
			const otherItemBounds = adjacentItem.getBoundingClientRect();
			const otherItemCenterX =
				otherItemBounds.left + otherItemBounds.width * 0.5;
			maxSnapDx =
				Math.abs(centerX - (centerX + otherItemCenterX) * 0.5) +
				this.config.snapStickyDistance;
		}
		const currentItemCenterY =
			currentItemBounds.top + currentItemBounds.height * 0.5;
		const targetX =
			currentItemCenterX -
			currentItemBounds.width *
				0.5 *
				Math.max(
					-1,
					Math.min(
						1,
						(this.config.targetPositionRatio * dx) / maxSnapDx
					)
				);
		this.targetPositionChanged.emit({ x: targetX, y: currentItemCenterY });
	}

	private scrollToWord(index: number, velocity: number = 0) {
		const properties = {
			time: WordScrollListComponent.getTime(),
			position: this.getScrollPosition(),
			velocity,
		};
		this.snapInterval = setInterval(
			() => this.updateSnapPosition(properties, index),
			this.config.animationInterval
		);
	}

	private updateSnapPosition(
		lastProperties: { position: number; velocity: number; time: number },
		snapWordIndex: number
	) {
		let velocity = lastProperties.velocity;
		if (lastProperties.position < this.minScrollPosition && velocity < 0) {
			velocity = 0;
		} else if (lastProperties.position > 0 && velocity > 0) {
			velocity = 0;
		} else if (Math.abs(velocity) > this.config.snapMaxSpeed) {
			velocity = Math.sign(velocity) * this.config.snapMaxSpeed;
		}
		const snapPosition = this.getWordSnapPosition(snapWordIndex);
		const t = WordScrollListComponent.getTime();
		const dt = t - lastProperties.time;
		const snapDx = snapPosition - lastProperties.position;
		velocity +=
			snapDx < 0
				? -this.config.snapAcceleration * dt
				: this.config.snapAcceleration * dt;
		let maxSpeed = this.config.snapMaxSpeed;
		if (Math.abs(snapDx) <= this.config.snapDecelerationDistance) {
			// near snap position - start slowing down
			maxSpeed *= Math.abs(snapDx) / this.config.snapDecelerationDistance;
		}
		if (Math.abs(velocity) > maxSpeed) {
			// over max speed
			velocity = Math.sign(velocity) * maxSpeed;
		}
		if (Math.abs(velocity) < this.config.snapMinSpeed) {
			// under min speed
			velocity = Math.sign(velocity) * this.config.snapMinSpeed;
		}
		const dx = 0.5 * (velocity + lastProperties.velocity) * dt;
		if (
			Math.sign(dx) === Math.sign(snapDx) &&
			Math.abs(dx) >= Math.abs(snapDx) &&
			Math.abs(dx) < 10
		) {
			// close enough - end snap
			this.setScrollPosition(snapPosition);
			clearInterval(this.snapInterval);
			this.snapInterval = null;
			this.selectedWordIndex =
				this.getWordIndexFromScrollPosition(snapPosition);
		} else {
			const position = lastProperties.position + dx;
			this.setScrollPosition(position);
			lastProperties.velocity = velocity;
			lastProperties.position = position;
			lastProperties.time = t;
			this.selectedWordIndex =
				this.getWordIndexFromScrollPosition(position);
		}
		this.updateTargetPosition();
	}

	private getScrollPosition(): number {
		if (!this.scrollContent || !this.scrollContent.nativeElement) {
			return 0;
		}
		return this.scrollContent.nativeElement.offsetLeft;
	}

	private setScrollPosition(position: number) {
		if (!this.scrollContent || !this.scrollContent.nativeElement) {
			return;
		}
		return (this.scrollContent.nativeElement.style.left = position + "px");
	}
}
