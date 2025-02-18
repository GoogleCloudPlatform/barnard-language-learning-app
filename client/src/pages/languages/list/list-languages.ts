import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { I18nService } from '../../../i18n/i18n.service';
import { EndangeredLanguage, EndangeredLanguageService } from '../../../services/endangered-language';
import { AppRoutes } from '../../../app/routes';

@Component({
  selector: 'app-list-languages',
  templateUrl: './list-languages.html',
  styleUrls: ['./list-languages.scss']
})
export class ListLanguagesPageComponent {
  public get endangeredLanguages(): EndangeredLanguage[] { return this.endangeredLanguageService.languages; }

  private _currentLanguageIndex = 0;
  public get currentLanguageIndex() { return this._currentLanguageIndex; }
  public set currentLanguageIndex(value: number) {
    this._currentLanguageIndex = value;
    const state = history.state;
    state.languageIndex = value;
    history.replaceState(state, '');
  }

  constructor(private router: Router,
    private i18nService: I18nService,
    private endangeredLanguageService: EndangeredLanguageService) {
    this._currentLanguageIndex = history.state.languageIndex || 0;
  }

  onLanguageChanged(index: number) {
    this.currentLanguageIndex = index;
  }

  onCloseClick(ev: MouseEvent) {
    ev.stopPropagation();
    history.back();
  }

  onLanguageClick(code: string) {
    console.log(AppRoutes.ListLanguages, code)
    this.router.navigate([AppRoutes.ListLanguages, code]);
  }

  prefixImageUrl(sampleWordImageURL: string): string {
    return `${this.endangeredLanguageService.imageAssetsURL}${sampleWordImageURL}`;
  }
}
