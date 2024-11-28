import { NgModule } from "@angular/core";
import { AppToolbarComponent } from "./app-toolbar";
import { LogoModule } from "../../components/logo/logo.module";
import { MatToolbarModule } from "@angular/material/toolbar";

@NgModule({
	declarations: [AppToolbarComponent],
	exports: [AppToolbarComponent],
	imports: [MatToolbarModule, LogoModule],
})
export class AppToolbarModule {}
