import { Component } from "@angular/core";
import { SessionService } from "../../services/session";
import { environment } from "../../environments/environment";

@Component({
	selector: "app-sidenav",
	templateUrl: "./sidenav.html",
	styleUrls: ["./sidenav.scss"],
})
export class SidenavComponent {
	get addToHomeScreenEnabled(): boolean {
		return !!this.sessionService.currentSession.installPrompt;
	}
	get termsAndPrivacyEnabled(): boolean {
		return environment.pages.termsAndPrivacy.enabled;
	}

	constructor(private sessionService: SessionService) {}

	onAddToHomeScreenClick() {
		this.sessionService.currentSession.installPrompt.prompt();
		this.sessionService.currentSession.installPrompt.userChoice.then(() => {
			this.sessionService.currentSession.installPrompt = null;
		});
	}
}
