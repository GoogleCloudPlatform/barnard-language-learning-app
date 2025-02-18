export type FeedbackType = "suggested"

export interface Feedback {
  word: string;
  language: string;
  englishWord: string;
  nativeWord: string;
  nativeLanguage: string;
  transliteration: string;
  recording: Blob|null;
  suggestedTranslation: string;
  suggestedTransliteration: string;
  types: FeedbackType;
  content: string;
}