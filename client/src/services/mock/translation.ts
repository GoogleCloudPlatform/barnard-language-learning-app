import { Injectable } from "@angular/core";
import { WordTranslation } from "../entities/translation";
import { ITranslationService } from "../translation";

@Injectable()
export class MockTranslationService implements ITranslationService {
	public async translate(
		words: string[],
		primaryLanguage: string,
		targetLanguage: string,
		maxTranslations: number = 0
	): Promise<WordTranslation[]> {
		return words.map((w, index) => ({
			english: w,
			translations: [
				{
					original: w,
					english: w + " en",
					translation: index > 0 ? w + " tr" + index : "白天",
					transliteration: "白天",
					translated_word: "白天",					
					sentence: "random sentence with word " + w,
					soundURL:
						index > 1
							? "https://storage.googleapis.com/woolaroo_audio_test/sounds/Shona/Table_Tagdsfgsd.wav"
							: null,
				},
				{
					original: w,
					english: w + " en" + index,
					translation: index > 0 ? w + " tr" : "白天",
					transliteration: "translit",
		  			translated_word: "白天",							
          			sentence: "random sentence with word " + w,
					soundURL:
						index > 1 ? "assets/debug/translation.mp3?v=1" : null,
				},
			],
		}));
	}
}
