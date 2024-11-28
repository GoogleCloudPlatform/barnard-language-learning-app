import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { SidenavComponent } from "./sidenav";
import { MatButtonModule } from "@angular/material/button";
import { MatListModule } from "@angular/material/list";
import { IconComponentModule } from "../../components/icon/icon.module";
import { LogoModule } from "../../components/logo/logo.module";
import { LanguageSelectorModule } from "../../components/language-selector/language-selector.module";
import { I18nModule } from "../../i18n/i18n.module";

@NgModule({
	declarations: [SidenavComponent],
	exports: [SidenavComponent],
	imports: [
		CommonModule,
		RouterModule,
		MatButtonModule,
		MatListModule,
		IconComponentModule,
		LogoModule,
		I18nModule,
		LanguageSelectorModule,
	],
})
export class SidenavModule {}
