export interface Translation {
	english: string;
	original: string;
	translation: string;
	transliteration: string;
	soundURL: string | null;
	sentence: string | null;
	translated_word: string | null;
	split_sentence: string[] | null;
}

export interface WordTranslation {
	english: string;
	translations: Translation[];
}
