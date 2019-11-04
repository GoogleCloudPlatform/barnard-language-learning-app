import { AfterViewInit, Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { AppRoutes } from 'app/routes';
import { IAnalyticsService, ANALYTICS_SERVICE } from 'services/analytics';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-page-intro-about',
  templateUrl: './about.html',
  styleUrls: ['./about.scss']
})
export class IntroAboutPageComponent implements AfterViewInit {
  constructor( private router: Router,
               @Inject(ANALYTICS_SERVICE) private analyticsService: IAnalyticsService ) {
  }

  ngAfterViewInit() {
    this.analyticsService.logPageView(this.router.url, 'Intro - About');
  }

  onNextClick() {
    this.router.navigateByUrl(AppRoutes.IntroFeedback);
  }

  onSkipClick() {
    if (environment.pages.termsAndPrivacy.enabled) {
      this.router.navigateByUrl(AppRoutes.IntroTermsAndConditions);
    } else {
      this.router.navigateByUrl(AppRoutes.ImageSource);
    }
  }
}
