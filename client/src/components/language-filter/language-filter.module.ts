import { NgModule } from "@angular/core";
import { LanguageFilterComponent } from "./language-filter.component";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { MatIconModule } from "@angular/material/icon";
import { FormsModule } from "@angular/forms";
import { ScrollListModule } from "../scroll-list/scroll-list.module";
import { MatButtonModule } from "@angular/material/button";
import { I18nModule } from "../../i18n/i18n.module";

@NgModule({
	declarations: [LanguageFilterComponent],
	exports: [LanguageFilterComponent],
	imports: [
		MatFormFieldModule,
		MatButtonModule,
		MatSelectModule,
		MatIconModule,
		FormsModule,
		ScrollListModule,
		I18nModule,
	],
})
export class LanguageFilterModule {}
