import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { I18nModule } from "../../../i18n/i18n.module";
import { ListLanguagesPageComponent } from "./list-languages";
import { IconComponentModule } from "../../../components/icon/icon.module";
import { ScrollListModule } from "../../../components/scroll-list/scroll-list.module";
import { PaginationIndicatorModule } from "../../../components/pagination-indicator/pagination-indicator.module";
import { PageHeaderModule } from "../../../components/page-header/page-header.module";

@NgModule({
	declarations: [ListLanguagesPageComponent],
	exports: [ListLanguagesPageComponent],
	imports: [
		RouterModule,
		CommonModule,
		PageHeaderModule,
		I18nModule,
		IconComponentModule,
		ScrollListModule,
		PaginationIndicatorModule,
	],
})
export class ListLanguagesModule {}
