import { Inject, Injectable } from "@angular/core";
import { IMAGE_RECOGNITION_CONFIG } from "../../services/image-recognition";
import { HttpClient } from "@angular/common/http";
import {
	GoogleImageRecognitionServiceBase,
	GoogleImageRecognitionConfigBase,
	RecognitionResponse,
} from "../../services/google/image-recognition";
import { retry } from "rxjs/operators";

interface APIImageRecognitionConfig extends GoogleImageRecognitionConfigBase {
	endpointURL: string;
	retryCount: number;
}

@Injectable()
export class APIImageRecognitionService extends GoogleImageRecognitionServiceBase {
	constructor(
		@Inject(IMAGE_RECOGNITION_CONFIG)
		private config: APIImageRecognitionConfig,
		private http: HttpClient
	) {
		super(config);
	}

	protected async loadImageDescriptions(
		imageBase64: string
	): Promise<RecognitionResponse | null> {
		return new Promise<RecognitionResponse>((resolve, reject) => {
			this.http
				.post<RecognitionResponse>(this.config.endpointURL, imageBase64)
				.pipe(retry(this.config.retryCount))
				.subscribe((response) => {
					if (response.labelAnnotations) {
						resolve(response);
					} else {
						// old format - array of strings
						const words = response as any as string[];
						resolve({
							labelAnnotations: words.map((w) => ({
								description: w,
								score: 1,
								topicality: 1,
							})),
							safeSearchAnnotation: {},
							error: null,
						});
					}
				}, reject);
		});
	}
}
