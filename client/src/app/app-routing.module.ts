import { NgModule } from "@angular/core";
import { AppRoutes } from "../app/routes";
import { Routes, RouterModule } from "@angular/router";
import { SplashPageComponent } from "../pages/splash/splash";
import { IntroAboutPageComponent } from "../pages/intro/about/about";
import { IntroTermsPageComponent } from "../pages/intro/terms/terms";
import { TermsPageComponent } from "../pages/terms/terms";
import { PhotoSourcePageComponent } from "../pages/photo-source/photo-source";
import { CapturePageComponent } from "../pages/capture/capture";
import { CaptionImagePageComponent } from "../pages/caption-image/caption-image";
import { TranslatePageComponent } from "../pages/translate/translate";
import { FeedbackPageComponent } from "../pages/feedback/feedback";
import { AddWordPageComponent } from "../pages/add-word/add-word";
import { AboutPageComponent } from "../pages/about/about";
import { TechnologyPageComponent } from "../pages/technology/technology";
import { ChangeLanguagePageComponent } from "../pages/languages/change/change-language";
import { ListLanguagesPageComponent } from "../pages/languages/list/list-languages";
import { ViewLanguagePageComponent } from "../pages/languages/view/view-language";
import { languagePrefixMatcher } from "../util/routing";

const routes: Routes = [
	{
		matcher: languagePrefixMatcher(),
		children: [
			{ path: "", redirectTo: AppRoutes.Splash, pathMatch: "full" },
			{ path: AppRoutes.Splash, component: SplashPageComponent },
			{
				path: AppRoutes.Intro,
				redirectTo: AppRoutes.IntroAbout,
				pathMatch: "full",
			},
			{ path: AppRoutes.IntroAbout, component: IntroAboutPageComponent },
			{
				path: AppRoutes.IntroTermsAndConditions,
				component: IntroTermsPageComponent,
			},
			{
				path: AppRoutes.TermsAndConditions,
				component: TermsPageComponent,
			},
			{
				path: AppRoutes.ImageSource,
				component: PhotoSourcePageComponent,
			},
			{ path: AppRoutes.CaptureImage, component: CapturePageComponent },
			{
				path: AppRoutes.CaptionImage,
				component: CaptionImagePageComponent,
			},
			{ path: AppRoutes.Translate, component: TranslatePageComponent },
			{ path: AppRoutes.Feedback, component: FeedbackPageComponent },
			{ path: AppRoutes.About, component: AboutPageComponent },
			{ path: AppRoutes.Technology, component: TechnologyPageComponent },
			{ path: AppRoutes.AddWord, component: AddWordPageComponent },
			{
				path: AppRoutes.ChangeLanguage,
				component: ChangeLanguagePageComponent,
			},
			{
				path: AppRoutes.ViewLanguage,
				component: ViewLanguagePageComponent,
			},
			{
				path: AppRoutes.ListLanguages,
				component: ListLanguagesPageComponent,
			},
			{ path: "**", component: SplashPageComponent }, // TODO: not found page
		],
	},
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class AppRoutingModule {}
