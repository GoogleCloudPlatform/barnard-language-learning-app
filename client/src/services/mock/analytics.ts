import { Injectable } from "@angular/core";
import { IAnalyticsService } from "../analytics";
import { getLogger } from "../../util/logging";

const logger = getLogger("EndangeredLanguageService");

@Injectable()
export class MockAnalyticsService implements IAnalyticsService {
	public async logPageView(path: string, title: string) {
		logger.log(`Logged page view: ${path} - ${title}`);
	}

	public async logButtonClick(buttonID: string) {
		logger.log(`Logged button click: ${buttonID}`);
	}
}
