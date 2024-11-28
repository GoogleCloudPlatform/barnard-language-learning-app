import { Inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { retry } from "rxjs/operators";
import {
	InvalidFormatError,
	InappropriateContentError,
} from "../entities/errors";
import {
	IImageRecognitionService,
	IMAGE_RECOGNITION_CONFIG,
	ImageDescription,
} from "../image-recognition";
import { resizeImage } from "../../util/image";
import { getLogger } from "../../util/logging";

export enum SafeSearchLikelihood {
	VERY_UNLIKELY = "VERY_UNLIKELY",
	UNLIKELY = "UNLIKELY",
	POSSIBLE = "POSSIBLE",
	LIKELY = "LIKELY",
	VERY_LIKELY = "VERY_LIKELY",
}

export enum SafeSearchCategory {
	SPOOF = "spoof",
	MEDICAL = "medical",
	ADULT = "adult",
	VIOLENCE = "violence",
}

export interface GoogleImageRecognitionConfigBase {
	maxFileSize: number;
	validImageFormats: string[];
	resizedImageDimension: number;
	resizedImageQuality: number;
	maxResults: number;
	singleWordDescriptionsOnly: boolean;
	maxSafeSearchLikelihoods: { [index: string]: SafeSearchLikelihood };
}

export interface GoogleImageRecognitionConfig
	extends GoogleImageRecognitionConfigBase {
	apiKey: string;
	retryCount: number;
}

interface RecognitionAnnotation {
	description: string;
	score: number;
	topicality: number;
}

export interface RecognitionResponse {
	labelAnnotations: Array<RecognitionAnnotation>;
	safeSearchAnnotation: { [index: string]: SafeSearchLikelihood };
	error: { code: number; message: string } | null;
}

const logger = getLogger("GoogleImageRecognitionServiceBase");

const VISION_URL = "https://vision.googleapis.com/v1/images:annotate?key=";

export class GoogleImageRecognitionServiceBase
	implements IImageRecognitionService
{
	private baseConfig: GoogleImageRecognitionConfigBase;

	constructor(
		@Inject(IMAGE_RECOGNITION_CONFIG)
		baseConfig: GoogleImageRecognitionConfigBase
	) {
		this.baseConfig = baseConfig;
	}

	private static isSingleWord(value: RecognitionAnnotation) {
		return value.description.trim().split(" ").length === 1;
	}

	private static removeDuplicateWords(
		annotations: RecognitionAnnotation[]
	): RecognitionAnnotation[] {
		const newAnnotations: RecognitionAnnotation[] = [];
		annotations.forEach((ann) => {
			if (
				!newAnnotations.find(
					(newAnn) => ann.description === newAnn.description
				)
			) {
				newAnnotations.push(ann);
			}
		});
		return newAnnotations;
	}

	private static getSafeSearchLikelihoodIndex(
		likelihood: SafeSearchLikelihood
	): number {
		let index = 0;
		for (const i of Object.values(SafeSearchLikelihood)) {
			if (i === likelihood) {
				return index;
			}
			index++;
		}
		return -1;
	}

	public async loadDescriptions(
		imageData: Blob
	): Promise<ImageDescription[]> {
		if (this.baseConfig.validImageFormats.indexOf(imageData.type) < 0) {
			throw new InvalidFormatError("Image is not in supported format");
		}
		if (imageData.size > this.baseConfig.maxFileSize) {
			logger.log(
				"Image file size is too large - resizing: " + imageData.size
			);
			imageData = await resizeImage(
				imageData,
				this.baseConfig.resizedImageDimension,
				this.baseConfig.resizedImageDimension,
				this.baseConfig.resizedImageQuality
			);
			logger.log("New image size: " + imageData.size);
		}
		return new Promise<ImageDescription[]>((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => {
				const imageURL = reader.result as string;
				const imageDataBase64 = imageURL.split(",")[1]; // remove data scheme prefix
				this.loadImageDescriptions(imageDataBase64).then((response) => {
					let descriptions = null;
					try {
						descriptions = this.filterImageDescriptions(response);
					} catch (err) {
						logger.warn("Error in image response", err);
						reject(err);
						return;
					}
					resolve(descriptions);
				}, reject);
			};
			reader.onerror = (err) => {
				logger.warn("Error reading image data", err);
				reject(err);
			};
			reader.readAsDataURL(imageData);
		});
	}

	protected async loadImageDescriptions(
		imageBase64: string
	): Promise<RecognitionResponse | null> {
		throw new Error("Not implemented");
	}

	private filterImageDescriptions(
		response: RecognitionResponse | null
	): ImageDescription[] {
		if (!response) {
			logger.warn("No Labels detected");
			throw new Error("No Labels detected");
		}
		// check if image as flagged as inappropriate
		const maxLikelihoods = this.baseConfig.maxSafeSearchLikelihoods;
		for (const cat in maxLikelihoods) {
			if (
				response.safeSearchAnnotation[cat] &&
				maxLikelihoods[cat] &&
				GoogleImageRecognitionServiceBase.getSafeSearchLikelihoodIndex(
					response.safeSearchAnnotation[cat]
				) >
					GoogleImageRecognitionServiceBase.getSafeSearchLikelihoodIndex(
						maxLikelihoods[cat]
					)
			) {
				logger.warn(
					"Error loading image descriptions: image is inappropriate"
				);
				throw new InappropriateContentError("Image is inappropriate");
			}
		}
		// check if image has no annotations
		if (
			!response ||
			!response.labelAnnotations ||
			response.labelAnnotations.length === 0
		) {
			logger.warn("No Labels detected");
			throw new Error("No Labels detected");
		}
		// filter out any annotations with multiple words
		let annotations = response.labelAnnotations;
		if (this.baseConfig.singleWordDescriptionsOnly) {
			annotations = annotations.filter(
				GoogleImageRecognitionServiceBase.isSingleWord
			);
		}
		// filter out duplicates
		annotations =
			GoogleImageRecognitionService.removeDuplicateWords(annotations);
		return annotations;
	}
}

@Injectable()
export class GoogleImageRecognitionService extends GoogleImageRecognitionServiceBase {
	constructor(
		@Inject(IMAGE_RECOGNITION_CONFIG)
		private config: GoogleImageRecognitionConfig,
		private http: HttpClient
	) {
		super(config);
	}

	protected async loadImageDescriptions(
		imageBase64: string
	): Promise<RecognitionResponse | null> {
		return new Promise<RecognitionResponse | null>((resolve, reject) => {
			this.http
				.post<{ responses: RecognitionResponse[] }>(
					VISION_URL + this.config.apiKey,
					{
						requests: [
							{
								image: { content: imageBase64 },
								features: [
									{
										type: "LABEL_DETECTION",
										maxResults: this.config.maxResults,
									},
									{ type: "SAFE_SEARCH_DETECTION" },
								],
							},
						],
					}
				)
				.pipe(retry(this.config.retryCount))
				.subscribe((response) => {
					// check that image has at least one annotation
					if (!response.responses) {
						logger.warn("Empty response from Cloud Vision");
						resolve(null);
					}
					// check errors
					const firstResponse = response.responses[0];
					if (firstResponse.error) {
						logger.warn(
							"Error loading image descriptions: " +
								firstResponse.error
						);
						reject(new Error(firstResponse.error.message));
						return;
					}
					resolve(firstResponse);
				}, reject);
		});
	}
}
