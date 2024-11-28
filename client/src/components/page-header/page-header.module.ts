import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatToolbarModule } from "@angular/material/toolbar";
import { I18nModule } from "../../i18n/i18n.module";
import { IconComponentModule } from "../icon/icon.module";
import { PageHeaderComponent } from "./page-header";

@NgModule({
	declarations: [PageHeaderComponent],
	exports: [PageHeaderComponent],
	imports: [CommonModule, MatToolbarModule, IconComponentModule, I18nModule],
})
export class PageHeaderModule {}
