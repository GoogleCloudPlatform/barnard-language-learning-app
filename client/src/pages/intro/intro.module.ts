import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { FormsModule } from "@angular/forms";
import { ScrollListModule } from "../../components/scroll-list/scroll-list.module";
import { LogoModule } from "../../components/logo/logo.module";
import { PaginationIndicatorModule } from "../../components/pagination-indicator/pagination-indicator.module";
import { IntroAboutPageComponent } from "./about/about";
import { IntroTermsPageComponent } from "./terms/terms";
import { I18nModule } from "../../i18n/i18n.module";
import { CommonModule } from "@angular/common";

@NgModule({
	declarations: [IntroAboutPageComponent, IntroTermsPageComponent],
	imports: [
		RouterModule,
		CommonModule,
		MatButtonModule,
		MatCheckboxModule,
		FormsModule,
		PaginationIndicatorModule,
		I18nModule,
		ScrollListModule,
		LogoModule,
	],
})
export class IntroPageModule {}
