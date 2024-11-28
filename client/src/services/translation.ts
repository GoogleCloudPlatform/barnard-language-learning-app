import { InjectionToken } from '@angular/core';
import { WordTranslation } from './entities/translation';

export interface ITranslationService {
  translate(englishWords: string[], primaryLanguage: string, targetLanguage: string, maxTranslations: number): Promise<WordTranslation[]>;
}


export const TRANSLATION_SERVICE = new InjectionToken<ITranslationService>('Translation service');
export const TRANSLATION_CONFIG = new InjectionToken<any>('Translation service config');
export const SENTENCE_CONFIG = new InjectionToken<any>('Sentence service config');
