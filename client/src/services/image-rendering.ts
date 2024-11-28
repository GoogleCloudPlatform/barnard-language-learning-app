import { Inject, Injectable, InjectionToken } from "@angular/core";
import { Translation } from "./entities/translation";
import { canvasToBlob } from "../util/image";
import { I18nService, Language } from "../i18n/i18n.service";
import { EndangeredLanguage } from "./endangered-language";

interface ImageRenderingConfig {
	dropShadowDistance: number;
	dropShadowColor: string;
	foregroundColor: string;
	languages: ImageRenderingTextConfig;
	transliteration: ImageRenderingTextConfig;
	translation: ImageRenderingTextConfig;
	originalWord: ImageRenderingTextConfig;
	line: { width: number; height: number; marginBottom: number };
	banner: {
		backgroundColor: string;
		height: number;
		logoY: number;
		logoHeight: number;
		logoURL: string;
		attributionHeight: number;
		attributionURL: string;
		spacing: number;
	};
	padding: number;
}

interface ImageRenderingTextConfig {
	font: string;
	lineHeight: number;
	lineSpacing: number;
	marginBottom: number;
}

export const IMAGE_RENDERING_CONFIG = new InjectionToken<ImageRenderingConfig>(
	"Image rendering config"
);

@Injectable()
export class ImageRenderingService {
	private static _getTextLines(
		context: CanvasRenderingContext2D,
		text: string,
		maxWidth: number
	): string[] {
		const lines: string[] = [];
		let remainingText = text;
		while (remainingText) {
			const metrics = context.measureText(remainingText);
			if (metrics.width < maxWidth) {
				lines.push(remainingText);
				break;
			}
			let breakIndex = Math.floor(
				(remainingText.length * maxWidth) / metrics.width
			);
			if (breakIndex <= 0) {
				lines.push(remainingText);
				break;
			}
			const prevWhitespaceIndex = remainingText.lastIndexOf(
				" ",
				breakIndex
			);
			if (prevWhitespaceIndex >= 0) {
				breakIndex = prevWhitespaceIndex;
			}
			lines.push(remainingText.slice(0, breakIndex));
			remainingText = remainingText.slice(breakIndex).trim();
		}
		return lines;
	}

	private static async _loadImage(url: string): Promise<HTMLImageElement> {
		return new Promise((resolve, reject) => {
			const image: HTMLImageElement = document.createElement("img");
			image.onload = () => resolve(image);
			image.onerror = reject;
			image.src = url;
		});
	}

	constructor(
		@Inject(IMAGE_RENDERING_CONFIG) private config: ImageRenderingConfig,
		private i18n: I18nService
	) {}

	async renderImage(
		imageData: Blob,
		word: Translation,
		sourceLanguage: Language,
		endangeredLanguage: EndangeredLanguage,
		width: number,
		height: number
	): Promise<Blob> {
		const imageURL = URL.createObjectURL(imageData);
		let image: HTMLImageElement;
		try {
			image = await ImageRenderingService._loadImage(imageURL);
		} catch (ex) {
			URL.revokeObjectURL(imageURL);
			throw ex;
		}

		const canvas: HTMLCanvasElement = document.createElement("canvas");
		canvas.width = width;
		canvas.height = height;
		const imageWidth = image.naturalWidth;
		const imageHeight = image.naturalHeight;
		const context = canvas.getContext("2d");
		if (!context) {
			throw new Error("Unable to create canvas context");
		}
		// multiplier to scale canvas down to contain image dimensions
		const imageScale = Math.min(imageWidth / width, imageHeight / height);
		const croppedImageWidth = Math.round(width * imageScale);
		const croppedImageHeight = Math.round(height * imageScale);
		const croppedImageDx = (imageWidth - croppedImageWidth) * 0.5;
		const croppedImageDy = (imageHeight - croppedImageHeight) * 0.5;
		context.drawImage(
			image,
			croppedImageDx,
			croppedImageDy,
			croppedImageWidth,
			croppedImageHeight,
			0,
			0,
			width,
			height
		);
		const scale = Math.min(
			width / window.innerWidth,
			height / window.innerHeight
		);

		await this._renderBanner(context, width, scale);

		if (!word) {
			return canvasToBlob(canvas);
		}
		context.setTransform(scale, 0, 0, scale, 0, 0);
		this._renderTranslations(
			context,
			word,
			sourceLanguage,
			endangeredLanguage,
			width,
			height,
			scale
		);
		return canvasToBlob(canvas);
	}

	private _renderTranslations(
		context: CanvasRenderingContext2D,
		word: Translation,
		sourceLanguage: Language,
		endangeredLanguage: EndangeredLanguage,
		width: number,
		height: number,
		scale: number
	) {
		const centerX = (width * 0.5) / scale;
		let y = height / scale; // start at bottom
		const maxTextWidth = (width - 2 * this.config.padding) / scale;
		y = this._renderText(
			context,
			word.original || word.english,
			this.config.originalWord,
			centerX,
			y,
			maxTextWidth
		);
		if (word.translation && word.translation !== word.transliteration) {
			y = this._renderText(
				context,
				word.translation,
				this.config.translation,
				centerX,
				y,
				maxTextWidth
			);
		}
		if (word.transliteration) {
			y = this._renderText(
				context,
				word.transliteration,
				this.config.transliteration,
				centerX,
				y,
				maxTextWidth
			);
		}
		y = this._renderLine(context, centerX, y);
		const languagesText =
			this.i18n.getTranslation("languageToEndangeredLanguage", {
				sourceLanguage: sourceLanguage.name,
				endangeredLanguage: endangeredLanguage.name,
			}) || `${sourceLanguage.name} to ${endangeredLanguage.name}`;
		this._renderText(
			context,
			languagesText,
			this.config.languages,
			centerX,
			y,
			maxTextWidth
		);
	}

	private async _renderBanner(
		context: CanvasRenderingContext2D,
		width: number,
		scale: number
	) {
		const bannerConfig = this.config.banner;

		// draw background
		context.fillStyle = bannerConfig.backgroundColor;
		context.fillRect(0, 0, width, bannerConfig.height * scale);
		// draw logo image
		const logoImage = await ImageRenderingService._loadImage(
			bannerConfig.logoURL
		);

		let y = bannerConfig.logoY * scale;
		const logoHeight = bannerConfig.logoHeight * scale;
		const logoScale = logoHeight / logoImage.naturalHeight;
		const logoWidth = logoImage.naturalWidth * logoScale;
		const logoX = width * 0.5 - logoWidth * 0.5;

		context.drawImage(logoImage, logoX, y, logoWidth, logoHeight);

		// draw attribution image
		y += logoHeight + bannerConfig.spacing * scale;
		const attributionImage = await ImageRenderingService._loadImage(
			bannerConfig.attributionURL
		);
		const attributionHeight = bannerConfig.attributionHeight * scale;
		const attributionScale =
			attributionHeight / attributionImage.naturalHeight;
		const attributionWidth =
			attributionImage.naturalWidth * attributionScale;
		const attributionX = width * 0.5 - attributionWidth * 0.5;
		context.drawImage(
			attributionImage,
			attributionX,
			y,
			attributionWidth,
			attributionHeight
		);
	}

	private _renderLine(
		context: CanvasRenderingContext2D,
		centerX: number,
		bottomY: number
	): number {
		const lineConfig = this.config.line;
		const y = bottomY - lineConfig.height - lineConfig.marginBottom;
		context.fillStyle = this.config.dropShadowColor;
		context.fillRect(
			centerX + this.config.dropShadowDistance,
			y + this.config.dropShadowDistance,
			lineConfig.width,
			lineConfig.height
		);
		context.fillStyle = this.config.foregroundColor;
		context.fillRect(centerX, y, lineConfig.width, lineConfig.height);
		return y;
	}

	private _renderText(
		context: CanvasRenderingContext2D,
		text: string,
		config: ImageRenderingTextConfig,
		centerX: number,
		bottomY: number,
		maxWidth: number
	): number {
		context.font = config.font;
		let y = bottomY - config.marginBottom;
		const lines = ImageRenderingService._getTextLines(
			context,
			text,
			maxWidth
		);
		for (let k = lines.length - 1; k >= 0; k--) {
			const line = lines[k];
			const metrics = context.measureText(line);
			const x = centerX - Math.min(metrics.width, maxWidth) * 0.5;
			context.fillStyle = this.config.dropShadowColor;
			context.fillText(
				line,
				x + this.config.dropShadowDistance,
				y + this.config.dropShadowDistance,
				maxWidth
			);
			context.fillStyle = this.config.foregroundColor;
			context.fillText(line, x, y, maxWidth);
			y -= config.lineHeight;
			if (k > 0) {
				y -= config.lineSpacing;
			}
		}
		return y;
	}
}
