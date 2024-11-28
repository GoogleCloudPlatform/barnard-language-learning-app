import { Inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { IFeedbackService, FEEDBACK_CONFIG } from "../../services/feedback";
import { Feedback } from "../../services/entities/feedback";
import { getLogger } from "../../util/logging";

interface APIFeedbackConfig {
	feedbackEndpointURL: string;
}

const logger = getLogger("APIFeedbackService");

@Injectable()
export class APIFeedbackService implements IFeedbackService {
	public constructor(
		private http: HttpClient,
		@Inject(FEEDBACK_CONFIG) private config: APIFeedbackConfig
	) {}

	public async sendFeedback(feedback: Feedback): Promise<any> {
		logger.log("Sending feedback");
		const requestBody = {
			primary_word: feedback.word 
				? feedback.word.toLowerCase() 
				: "",
			english_word: feedback.englishWord 
				? feedback.englishWord.toLowerCase() 
				: "",
			translation: feedback.nativeWord 
				? feedback.nativeWord.toLowerCase() 
				: "",
			transliteration: feedback.transliteration 
				? feedback.transliteration.toLowerCase() 
				: "",
			suggested_translation: feedback.suggestedTranslation 
				? feedback.suggestedTranslation.toLowerCase() 
				: "",
			suggested_transliteration: feedback.suggestedTransliteration 
				? feedback.suggestedTransliteration.toLowerCase() 
				: "",
			language: feedback.language 
				? feedback.language 
				: "",
			native_language: feedback.nativeLanguage 
				? feedback.nativeLanguage 
				: "",
			types: feedback.types 
				? feedback.types 
				: "",
			content: feedback.content 
				? feedback.content 
				: "",
		};		
		const resp = await this.http
			.post(this.config.feedbackEndpointURL, requestBody, {
				responseType: "text",
			})
			.toPromise();

		logger.log("Feedback sent");
	}
}
