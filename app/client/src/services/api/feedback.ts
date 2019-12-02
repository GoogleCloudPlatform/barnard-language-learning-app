import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IFeedbackService, FEEDBACK_CONFIG } from 'services/feedback';
import { AddedWord, Feedback } from 'services/entities/feedback';

interface APIFeedbackConfig {
  addWordAudioEndpointURL: string;
  addWordEndpointURL: string;
  feedbackEndpointURL: string;
}

@Injectable()
export class APIFeedbackService implements IFeedbackService {
  public constructor(private http: HttpClient, @Inject(FEEDBACK_CONFIG) private config: APIFeedbackConfig) {
  }

  public async sendFeedback(feedback: Feedback): Promise<any> {
    let soundUrl: string|null = null;
    if (feedback.recording) {
      console.log('Sending audio');
      soundUrl = await this.http.post(this.config.addWordAudioEndpointURL, feedback.recording, { responseType: 'text' }).toPromise();
    }
    console.log('Sending feedback');
    const requestBody = {
      primary_word: feedback.word,
      english_word: feedback.englishWord,
      translation: feedback.nativeWord,
      transliteration: feedback.transliteration,
      sound_link: soundUrl,
      types: feedback.types,
      content: feedback.content
    };
    await this.http.post(this.config.feedbackEndpointURL, requestBody, { responseType: 'text' }).toPromise();
    console.log('Feedback sent');
  }

  public async addWord(word: AddedWord): Promise<any> {
    let soundUrl: string|null = null;
    if (word.recording) {
      console.log('Sending audio');
      soundUrl = await this.http.post(this.config.addWordAudioEndpointURL, word.recording, { responseType: 'text' }).toPromise();
    }
    console.log('Adding word');
    const requestBody = {
      primary_word: word.word,
      english_word: word.englishWord,
      translation: word.nativeWord,
      transliteration: word.transliteration,
      sound_link: soundUrl
    };
    await this.http.post(this.config.addWordEndpointURL, requestBody, { responseType: 'text' }).toPromise();
    console.log('Word added');
  }
}
