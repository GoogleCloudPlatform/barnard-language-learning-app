import { NgModule } from "@angular/core";
import { TranslatePipe } from "./i18n.pipes";
import { I18N_SERVICE_CONFIG, I18nService } from "./i18n.service";
import { environment } from "../environments/environment";
import { Directionality } from "@angular/cdk/bidi";
import { I18nDirectionality } from "./i18n.directionality";

@NgModule({
	declarations: [TranslatePipe],
	providers: [
		TranslatePipe,
		I18nService,
		{ provide: I18N_SERVICE_CONFIG, useValue: environment.i18n },
		{ provide: Directionality, useClass: I18nDirectionality },
	],
	exports: [TranslatePipe],
})
export class I18nModule {}
