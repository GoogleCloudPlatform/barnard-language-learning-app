import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  InjectionToken,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { Router } from '@angular/router';
import { IAnalyticsService, ANALYTICS_SERVICE } from '../../services/analytics';
import { IProfileService, PROFILE_SERVICE } from '../../services/profile';
import { AppRoutes } from '../../app/routes';
import { AnimationComponent } from '../../components/animation/animation';
import { environment } from '../../environments/environment';
import { loadCapturePageURL } from '../../util/camera';

interface SplashPageConfig {
  partnerLogoUrl?: string;
  videoMaxStartTime: number;
  maxLogosDelay: number;
  showLogosVideoPosition: number;
  logosDuration: number;
}

export const SPLASH_PAGE_CONFIG = new InjectionToken<SplashPageConfig>('Splash page config');

@Component({
  selector: 'app-page-splash',
  templateUrl: './splash.html',
  styleUrls: ['./splash.scss']
})
export class SplashPageComponent implements AfterViewInit, OnDestroy {
  private timeout: any = null;
  public videoStarted = false;
  public videoComplete = false;
  public logosVisible = false;
  public spinnerVisible = false;
  @ViewChild('video', { static: true })
  public video: ElementRef | null = null;
  @ViewChild('logoAnimation', { static: true })
  public logoAnimation: AnimationComponent | null = null;
  public get isLoading(): boolean { return !this.videoStarted && !this.logosVisible; }

  constructor(@Inject(SPLASH_PAGE_CONFIG) private config: SplashPageConfig,
    private router: Router,
    @Inject(ANALYTICS_SERVICE) private analyticsService: IAnalyticsService,
    @Inject(PROFILE_SERVICE) private profileService: IProfileService) {
  }

  ngAfterViewInit() {
    this.analyticsService.logPageView(this.router.url, 'Splash');
    this.startAnimations();
    window.addEventListener('focus', this.onWindowFocus);
    this.setTimeoutToNavigate(this.config.logosDuration);
  }

  ngOnDestroy() {
    window.removeEventListener('focus', this.onWindowFocus);
    this.clearTimeout();
  }

  onWindowFocus = () => {
    this.startAnimations();
  }

  startAnimations() {
    // start spinner hidden, then change to visible after 1 frame, so it fades in
    this.spinnerVisible = false;
    setTimeout(() => this.spinnerVisible = true, 1);
    this.videoStarted = false;
    this.videoComplete = false;
    this.logosVisible = false;
    if (this.video?.nativeElement) {
      const videoEl = this.video.nativeElement as HTMLVideoElement;
      videoEl.play();
      videoEl.currentTime = 0;
      this.setTimeoutToSkipVideo(this.config.videoMaxStartTime);
    } else {
      this.skipVideo();
    }
    if (this.logoAnimation) {
      this.logoAnimation.stop();
    }
    this.setTimeoutToShowLogos(this.config.videoMaxStartTime);
  }

  onVideoUpdate(ev: Event) {
    if (this.logosVisible) {
      return;
    }
    const video = ev.currentTarget as HTMLVideoElement;
    if (video.duration && video.currentTime / video.duration > this.config.showLogosVideoPosition) {
      this._showLogos();
    }
  }

  onVideoPlaying() {
    this.videoStarted = true;
    this.clearTimeout();
    this.setTimeoutToShowLogos(this.config.maxLogosDelay);
  }

  onVideoEnded() {
    this.videoComplete = true;
    if (!this.logosVisible) {
      this._showLogos();
    }
  }

  skipVideo() {
    this.videoComplete = true;
    this._showLogos();
  }

  _showLogos() {
    this.logosVisible = true;
    if (this.logoAnimation) {
      this.logoAnimation.play();
    }
    this.clearTimeout();
    this.setTimeoutToNavigate(this.config.logosDuration);
  }
  
  navigateToNextPage() {
    this.profileService.loadProfile().then(
      (profile) => {
        const skipIntro = (environment.pages.termsAndPrivacy.enabled && profile.termsAgreed)
          || (!environment.pages.termsAndPrivacy.enabled && profile.introViewed);
        if (!skipIntro) {
          this.router.navigateByUrl(AppRoutes.Intro);
        } else if (!profile.language || !profile.endangeredLanguage) {
          this.router.navigateByUrl(AppRoutes.ChangeLanguage);
        } else {
          loadCapturePageURL().then(
            url => this.router.navigateByUrl(url),
            () => this.router.navigateByUrl(AppRoutes.CaptureImage)
          );
        }
      },
      () => this.router.navigateByUrl(AppRoutes.Intro)
    );
  }

  private setTimeoutToNavigate(duration: number) {
    this.clearTimeout();
    this.timeout = setTimeout(() => this.navigateToNextPage(), duration);
  }

  private setTimeoutToSkipVideo(duration: number) {
    this.clearTimeout();
    this.timeout = setTimeout(() => {
      if (!this.videoStarted) {
        this.skipVideo();
      }
    }, duration);
  }

  private setTimeoutToShowLogos(duration: number) {
    this.clearTimeout();
    this.timeout = setTimeout(() => {
      this.videoComplete = true;
      if (!this.logosVisible) {
        this._showLogos();
      }
    }, duration);
  }

  private clearTimeout() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }
}
