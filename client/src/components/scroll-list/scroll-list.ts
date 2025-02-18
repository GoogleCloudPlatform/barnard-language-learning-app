import {
	AfterViewInit,
	Component,
	ContentChildren,
	Directive,
	ElementRef,
	EventEmitter,
	HostListener,
	Inject,
	InjectionToken,
	Input,
	OnDestroy,
	Output,
	QueryList,
	TemplateRef,
	ViewChild,
} from "@angular/core";
import { getLogger } from "../../util/logging";

@Directive({ selector: "[appScrollListItem]" })
export class ScrollListItem {
	public itemTemplate: TemplateRef<any>;

	constructor(private templateRef: TemplateRef<any>) {
		this.itemTemplate = this.templateRef;
	}
}

interface ScrollListConfig {
	animationInterval: number;
	snapMinSpeed: number;
	snapMaxSpeed: number;
	snapAcceleration: number;
	snapDeceleration: number;
	snapDecelerationDistance: number;
	snapStickyDistance: number;
	targetPositionRatio: number;
	draggingMinDistance: number;
}

export const SCROLL_LIST_CONFIG = new InjectionToken<ScrollListConfig>(
	"Scroll list config"
);

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

const logger = getLogger("ScrollListComponent");

@Component({
	selector: "app-scroll-list",
	templateUrl: "./scroll-list.html",
	styleUrls: ["./scroll-list.scss"],
})
export class ScrollListComponent implements AfterViewInit, OnDestroy {
	private dragInfo: DragInfo | null = null;
	private animationInterval: any = null;

	@ContentChildren(ScrollListItem, { descendants: true })
	items: QueryList<ScrollListItem> = new QueryList();
	@ViewChild("scrollContent", { static: true })
	public scrollContent: ElementRef | null = null;

	@Input()
	public snappingEnabled = true;
	@Input()
	public itemAlignment: "start" | "center" = "center";

	private _currentItem = -1;
	public get currentItem(): number {
		return Math.max(0, this._currentItem);
	}
	@Input()
	public set currentItem(value: number) {
		if (value !== this._currentItem) {
			const firstValue = this._currentItem < 0;
			this._currentItem = value;
			this.currentItemChanged.emit(value);
			if (!this.dragInfo && !firstValue) {
				// not dragging and not the initial value - animate to this item
				this.scrollToItem(value);
			}
		}
	}

	@Output()
	public currentItemChanged: EventEmitter<number> = new EventEmitter();

	private get minScrollPosition(): number {
		return this.getScrollContainerWidth() - this.getScrollContentWidth();
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

	constructor(
		@Inject(SCROLL_LIST_CONFIG) private config: ScrollListConfig,
		private hostElement: ElementRef
	) {}

	ngAfterViewInit() {
		this.alignItems();
		window.addEventListener("resize", this.onWindowResize);
		document.addEventListener("keyup", this.onDocumentKeyUp);
	}

	ngOnDestroy() {
		window.removeEventListener("resize", this.onWindowResize);
		document.removeEventListener("keyup", this.onDocumentKeyUp);
	}

	onWindowResize = () => {
		this.alignItems();
	};

	onDocumentKeyUp = (ev: KeyboardEvent) => {
		ev.preventDefault();
		switch (ev.key) {
			case "ArrowLeft":
				if (this.currentItem > 0) {
					this.currentItem--;
					this.scrollToItem(this.currentItem);
				}
				break;
			case "ArrowRight":
				if (this.currentItem < this.items.length - 1) {
					this.currentItem++;
					this.scrollToItem(this.currentItem);
				}
				break;
		}
	};

	@HostListener("touchstart", ["$event"])
	onTouchStart(ev: TouchEvent) {
		window.document.body.addEventListener("touchmove", this.onTouchMove, {
			passive: false,
		});
		window.document.body.addEventListener("touchend", this.onTouchEnd);
		const touch = ev.touches[0];
		this.startDrag(touch.clientX, touch.clientY);
	}

	@HostListener("mousedown", ["$event"])
	onMouseDown(ev: MouseEvent) {
		ev.preventDefault();
		ev.stopPropagation();
		window.document.body.addEventListener("mousemove", this.onMouseMove);
		window.document.body.addEventListener("mouseup", this.onMouseUp);
		this.startDrag(ev.clientX, ev.clientY);
	}

	@HostListener("touchend", ["$event"])
	onTouchEnd(ev: TouchEvent) {
		// ev.preventDefault();
		logger.log("touch end");
		window.document.body.removeEventListener("touchmove", this.onTouchMove);
		window.document.body.removeEventListener("touchend", this.onTouchEnd);
		if (this.isDragging) {
			window.document.body.addEventListener(
				"click",
				this.onMouseClick,
				true
			);
			setTimeout(this.clearClickHandlers, 1);
		}
		this.stopDrag();
	}

	onMouseUp = () => {
		window.document.body.removeEventListener("mousemove", this.onMouseMove);
		window.document.body.removeEventListener("mouseup", this.onMouseUp);
		if (this.isDragging) {
			window.document.body.addEventListener(
				"click",
				this.onMouseClick,
				true
			);
			setTimeout(this.clearClickHandlers, 1);
		}
		this.stopDrag();
	};

	clearClickHandlers = () => {
		window.document.body.removeEventListener(
			"click",
			this.onMouseClick,
			true
		);
	};

	onMouseClick = (ev: MouseEvent) => {
		window.document.body.removeEventListener(
			"click",
			this.onMouseClick,
			true
		);
		// prevent click events on child elements when dragging
		ev.preventDefault();
		ev.stopPropagation();
	};

	@HostListener("touchmove", ["$event"])
	onTouchMove = (ev: TouchEvent) => {
		ev.preventDefault();
		const touch = ev.touches[0];
		this.updateDrag(touch.clientX, touch.clientY);
	};

	onMouseMove = (ev: MouseEvent) => {
		this.updateDrag(ev.clientX, ev.clientY);
	};

	private static getTime(): number {
		return Date.now();
	}

	startDrag(x: number, y: number) {
		if (this.animationInterval) {
			clearInterval(this.animationInterval);
			this.animationInterval = null;
		}
		if (this.dragInfo && this.dragInfo.interval) {
			clearInterval(this.dragInfo.interval);
		}
		const positionX = this.getScrollPosition();
		const properties = {
			position: positionX,
			time: ScrollListComponent.getTime(),
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
		if (!this.snappingEnabled) {
			if (this.isDragging) {
				const velocity = this.dragInfo.velocityX;
				this.dragInfo = null;
				const decelerationInfo = {
					velocity: velocity,
					prevTime: ScrollListComponent.getTime(),
				};
				this.animationInterval = setInterval(
					() => this.updateDeceleration(decelerationInfo),
					this.config.animationInterval
				);
			} else {
				this.dragInfo = null;
			}
		} else if (this.isDragging) {
			const velocity = this.dragInfo.velocityX;
			this.dragInfo = null;
			const snapItemIndex = this.getEndingSnapItemIndex(
				this.getScrollPosition(),
				velocity
			);
			this.scrollToItem(snapItemIndex, velocity, true);
		} else {
			const itemIndex = this.getItemIndexFromPosition(
				this.dragInfo.lastClientX,
				this.dragInfo.lastClientY
			);
			this.dragInfo = null;
			if (itemIndex >= 0 && this.items && itemIndex < this.items.length) {
				this.scrollToItem(itemIndex, 0, true);
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
		this.currentItem = this.getItemIndexFromScrollPosition(
			scrollPosition,
			this.currentItem
		);
	}

	private alignItems() {
		if (
			!this.scrollContent ||
			this.currentItem < 0 ||
			this.itemAlignment !== "center"
		) {
			return;
		}
		const scrollContainer = this.hostElement.nativeElement as HTMLElement;
		const scrollContent = this.scrollContent.nativeElement;
		const items = scrollContent.getElementsByTagName("li");
		if (!items || this.currentItem >= items.length) {
			return;
		}
		const currentItem = items[this.currentItem];
		if (!currentItem) {
			return;
		}
		const containerBounds = scrollContainer.getBoundingClientRect();
		const centerX = containerBounds.left + containerBounds.width * 0.5;
		const currentItemBounds = currentItem.getBoundingClientRect();
		const currentItemCenterX =
			currentItemBounds.left + currentItemBounds.width * 0.5;
		this.setScrollPosition(centerX - currentItemCenterX);
	}

	private scrollToItem(
		index: number,
		velocity: number = 0,
		updateCurrentItem: boolean = false
	) {
		if (this.animationInterval) {
			clearInterval(this.animationInterval);
		}
		const properties = {
			time: ScrollListComponent.getTime(),
			position: this.getScrollPosition(),
			velocity,
		};
		this.animationInterval = setInterval(
			() => this.updateSnapPosition(properties, index, updateCurrentItem),
			this.config.animationInterval
		);
	}

	private updateScrollVelocity(lastProperties: {
		position: number;
		time: number;
	}) {
		const positionX = this.getScrollPosition();
		const dx = positionX - lastProperties.position;
		const t = ScrollListComponent.getTime();
		const dt = t - lastProperties.time;
		if (this.dragInfo) {
			this.dragInfo.velocityX = dx / dt;
		}
		lastProperties.position = positionX;
		lastProperties.time = t;
	}

	// predict where snap position will be after decelerating
	private getEndingSnapItemIndex(position: number, velocity: number): number {
		if (Math.abs(velocity) > this.config.snapMaxSpeed) {
			// over max speed
			velocity = Math.sign(velocity) * this.config.snapMaxSpeed;
		}
		const dt = this.config.animationInterval;
		const decelerationTime =
			dt *
			Math.ceil(Math.abs(velocity / this.config.snapAcceleration) / dt);
		const finalPosition = position + 0.5 * velocity * decelerationTime;
		return this.getItemIndexFromScrollPosition(
			finalPosition,
			this.currentItem
		);
	}

	private getItemSnapPosition(index: number): number {
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

	private getItemIndexFromScrollPosition(
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

	private getItemIndexFromPosition(x: number, y: number): number {
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

	private updateDeceleration(decelerationInfo: {
		velocity: number;
		prevTime: number;
	}) {
		// get target velocity
		let targetVelocity = 0;
		const scrollPos = this.getScrollPosition();
		let outsideBounds = false;
		const contentWidth = this.getScrollContentWidth();
		const containerWidth = this.getScrollContainerWidth();
		if (scrollPos > 0) {
			// too far right - accelerate left
			targetVelocity =
				-this.config.snapMaxSpeed *
				Math.min(1, scrollPos / this.config.snapDecelerationDistance);
			outsideBounds = true;
		} else {
			const minScroll = Math.min(0, containerWidth - contentWidth);
			if (scrollPos < minScroll) {
				// too far left - accelerate right
				targetVelocity =
					this.config.snapMaxSpeed *
					Math.min(
						1,
						(minScroll - scrollPos) /
							this.config.snapDecelerationDistance
					);
				outsideBounds = true;
			}
		}
		// accelerate towards target velocity
		let velocity = decelerationInfo.velocity;
		const t = ScrollListComponent.getTime();
		const dt = t - decelerationInfo.prevTime;
		const maxDV = this.config.snapDeceleration * dt;
		if (Math.abs(velocity - targetVelocity) > maxDV) {
			velocity =
				velocity > targetVelocity ? velocity - maxDV : velocity + maxDV;
		} else {
			velocity = targetVelocity;
		}
		// stop content from scrolling completely offscreen
		if (scrollPos < -contentWidth) {
			velocity = Math.max(0, velocity);
		} else if (scrollPos > containerWidth) {
			velocity = Math.min(0, velocity);
		}
		// update position
		if (velocity != 0 || outsideBounds) {
			decelerationInfo.prevTime = t;
			decelerationInfo.velocity = velocity;
			this.setScrollPosition(scrollPos + velocity * dt);
		} else {
			clearInterval(this.animationInterval);
			this.animationInterval = 0;
		}
	}

	private updateSnapPosition(
		lastProperties: { position: number; velocity: number; time: number },
		snapItemIndex: number,
		updateCurrentItem: boolean
	) {
		let velocity = lastProperties.velocity;
		if (lastProperties.position < this.minScrollPosition && velocity < 0) {
			velocity = 0;
		} else if (lastProperties.position > 0 && velocity > 0) {
			velocity = 0;
		} else if (Math.abs(velocity) > this.config.snapMaxSpeed) {
			velocity = Math.sign(velocity) * this.config.snapMaxSpeed;
		}
		const snapPosition = this.getItemSnapPosition(snapItemIndex);
		const t = ScrollListComponent.getTime();
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
			clearInterval(this.animationInterval);
			this.animationInterval = null;
			if (updateCurrentItem) {
				this.currentItem =
					this.getItemIndexFromScrollPosition(snapPosition);
			}
		} else {
			const position = lastProperties.position + dx;
			this.setScrollPosition(position);
			lastProperties.velocity = velocity;
			lastProperties.position = position;
			lastProperties.time = t;
			if (updateCurrentItem) {
				this.currentItem =
					this.getItemIndexFromScrollPosition(position);
			}
		}
	}

	private getScrollContainerWidth(): number {
		return this.hostElement.nativeElement.clientWidth;
	}

	private getScrollContentWidth(): number {
		if (!this.scrollContent || !this.scrollContent.nativeElement) {
			return 0;
		}
		const childNodes =
			this.scrollContent.nativeElement.getElementsByTagName("li");
		const firstChild = childNodes[0];
		const lastChild = childNodes[childNodes.length - 1];
		return (
			lastChild.offsetLeft + lastChild.offsetWidth - firstChild.offsetLeft
		);
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
