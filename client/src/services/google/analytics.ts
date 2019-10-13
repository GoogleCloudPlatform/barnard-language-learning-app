import { Inject, Injectable } from "@angular/core";
import { IAnalyticsService, ANALYTICS_CONFIG } from "../analytics";

interface GoogleAnalyticsConfig {
  trackerID:string;
}

@Injectable()
export class GoogleAnalyticsService implements IAnalyticsService {
  private _dataLayer:any[];

  constructor(@Inject(ANALYTICS_CONFIG) private config:GoogleAnalyticsConfig) {
    this._dataLayer = [];
    const script = document.createElement('script') as HTMLScriptElement;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${config.trackerID}`;
    script.async = true;
    script.onload = () => {
      console.log("Google Analytics initialized");
      const queuedEvents:Array<any> = this._dataLayer;
      this._dataLayer = (window as any).dataLayer = (window as any).dataLayer || [];
      this.log('js', new Date());
      this.log('config', config.trackerID, { 'send_page_view': false });
      if(queuedEvents) {
        for(const ev of queuedEvents) {
          this._dataLayer.push(ev);
        }
      }
    };
    script.onerror = err => {
      console.warn("Error initializing Google Analytics", err);
    };
    const head = document.getElementsByTagName('head')[0];
    head.appendChild(script);
    console.log("Initializing Google Analytics");
  }

  private log(...args:any[]) {
    this._dataLayer.push(arguments); // must be "arguments" (GA JS library expects argument list, not normal array)
  }

  private logEvent(category:string, action:string, label:string|null = null, value:string|null = null) {
    this.log('event', action, { 'event_category': category, 'event_label': label, 'value': value });
  }

  public async logPageView(path: string, title: string) {
    this.log('config', this.config.trackerID, { 'page_title': title, 'page_path': path });
  }

  public async logButtonClick(buttonID: string) {
    this.logEvent('button-click', buttonID);
  }
}
