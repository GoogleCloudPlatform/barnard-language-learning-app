import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatInputModule } from "@angular/material/input";
import { IconComponentModule } from "../../components/icon/icon.module";
import { TranslationSelectorComponent } from "./translation-selector";
import {
	SelectionLineComponent,
	SELECTION_LINE_CONFIG,
} from "./selection-line";
import {
	WordScrollListComponent,
	WORD_SCROLL_LIST_CONFIG,
} from "./word-scroll-list";
import { I18nModule } from "../../i18n/i18n.module";
import { environment } from "../../environments/environment";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { PipesModule } from "../../pipes/pipes.module";
import { ScrollListModule } from "../scroll-list/scroll-list.module";

@NgModule({
	declarations: [
		TranslationSelectorComponent,
		SelectionLineComponent,
		WordScrollListComponent,
	],
	exports: [TranslationSelectorComponent],
	imports: [
		CommonModule,
		IconComponentModule,
		MatInputModule,
		I18nModule,
		PipesModule,
		MatProgressSpinnerModule,
		ScrollListModule,
	],
	providers: [
		{
			provide: SELECTION_LINE_CONFIG,
			useValue: environment.components.translationSelector.selectionLine,
		},
		{
			provide: WORD_SCROLL_LIST_CONFIG,
			useValue: environment.components.translationSelector.scrollList,
		},
	],
})
export class TranslationSelectorModule {}
