import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BrowserModule } from "@angular/platform-browser";
import { LogoComponent } from "./logo";
import { PipesModule } from "../../pipes/pipes.module";
import { I18nModule } from "../../i18n/i18n.module";

@NgModule({
	declarations: [LogoComponent],
	exports: [LogoComponent],
	imports: [CommonModule, BrowserModule, PipesModule, I18nModule],
})
export class LogoModule {}
