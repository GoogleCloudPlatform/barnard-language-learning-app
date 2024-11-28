import { NgModule } from "@angular/core";
import { environment } from "../environments/environment";
import {
	IMAGE_RENDERING_CONFIG,
	ImageRenderingService,
} from "../services/image-rendering";
import { SessionService } from "../services/session";
import { ANALYTICS_CONFIG, ANALYTICS_SERVICE } from "./analytics";
import {
	ENDANGERED_LANGUAGE_CONFIG,
	EndangeredLanguageService,
} from "./endangered-language";
import { FEEDBACK_CONFIG, FEEDBACK_SERVICE } from "./feedback";
import {
	IMAGE_RECOGNITION_CONFIG,
	IMAGE_RECOGNITION_SERVICE,
} from "./image-recognition";
import { PROFILE_CONFIG, PROFILE_SERVICE } from "./profile";
import { SENTENCE_CONFIG, TRANSLATION_CONFIG, TRANSLATION_SERVICE } from "./translation";

@NgModule({
	declarations: [],
	providers: [
		SessionService,
		ImageRenderingService,
		{
			provide: IMAGE_RENDERING_CONFIG,
			useValue: environment.services.imageRendering.config,
		},
		EndangeredLanguageService,
		{
			provide: ENDANGERED_LANGUAGE_CONFIG,
			useValue: environment.services.endangeredLanguage.config,
		},
		{
			provide: IMAGE_RECOGNITION_SERVICE,
			useClass: environment.services.imageRecognition.type,
		},
		{
			provide: IMAGE_RECOGNITION_CONFIG,
			useValue: environment.services.imageRecognition.config,
		},
		{
			provide: TRANSLATION_SERVICE,
			useClass: environment.services.translation.type,
		},
		{
			provide: TRANSLATION_CONFIG,
			useValue: environment.services.translation.config,
		},
		{
			provide: SENTENCE_CONFIG,
			useValue: environment.services.sentence.config,
		},
		{
			provide: ANALYTICS_SERVICE,
			useClass: environment.services.analytics.type,
		},
		{
			provide: ANALYTICS_CONFIG,
			useValue: environment.services.analytics.config,
		},
		{
			provide: FEEDBACK_SERVICE,
			useClass: environment.services.feedback.type,
		},
		{
			provide: FEEDBACK_CONFIG,
			useValue: environment.services.feedback.config,
		},
		{
			provide: PROFILE_SERVICE,
			useClass: environment.services.profile.type,
		},
		{
			provide: PROFILE_CONFIG,
			useValue: environment.services.profile.config,
		},
	],
})
export class ServicesModule {}
