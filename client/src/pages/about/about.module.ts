import { NgModule } from "@angular/core";
import { PageHeaderModule } from "../../components/page-header/page-header.module";
import { AboutPageComponent } from "./about";
import { PipesModule } from "../../pipes/pipes.module";
import { I18nModule } from "../../i18n/i18n.module";

@NgModule({
	declarations: [AboutPageComponent],
	imports: [PipesModule, PageHeaderModule, I18nModule],
})
export class AboutPageModule {}
