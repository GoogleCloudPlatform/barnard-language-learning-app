import { NgModule } from "@angular/core";
import { TechnologyPageComponent } from "./technology";
import { PageHeaderModule } from "../../components/page-header/page-header.module";
import { I18nModule } from "../../i18n/i18n.module";

@NgModule({
	declarations: [TechnologyPageComponent],
	imports: [PageHeaderModule, I18nModule],
})
export class TechnologyPageModule {}
