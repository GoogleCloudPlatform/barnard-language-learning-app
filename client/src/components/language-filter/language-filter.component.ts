import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
	selector: "app-language-filter",
	templateUrl: "./language-filter.component.html",
	styleUrls: ["./language-filter.component.scss"],
})
export class LanguageFilterComponent {
	selectedRegion: string | null = "none";
	languageToSearch = "";
	@Output("onSearchLanguage") onSearchLanguage: EventEmitter<any> =
		new EventEmitter();

	private _regionIndex = 0;
	public get regionIndex(): number {
		return this._regionIndex;
	}

	private _allRegions: any[] = [];
	@Input()
	public set allRegions(value: any[]) {
		this._allRegions = value;
	}

	public get allRegions(): any[] {
		return this._allRegions;
	}

	constructor() {}

	onRegionChanged(index: number) {
		let _index = index;
		this.selectedRegion = this.allRegions[_index].code;
	}

	searchLanguage(filter?: string): void {
		if (filter) {
			this.onSearchLanguage.emit({
				region: "all",
				language: "all",
			});
			return;
		}

		this.onSearchLanguage.emit({
			region: this.selectedRegion,
			language: this.languageToSearch,
		});
	}
}
