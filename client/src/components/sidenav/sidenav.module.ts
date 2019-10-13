import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidenavComponent } from './sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { IconComponentModule } from 'components/icon/icon.module';
import { LogoModule } from 'components/logo/logo.module';

@NgModule({
  declarations: [
    SidenavComponent
  ],
  exports: [
    SidenavComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatListModule,
    IconComponentModule,
    LogoModule
  ]
})
export class SidenavModule {}
