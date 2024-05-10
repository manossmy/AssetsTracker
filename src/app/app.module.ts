import { NgModule } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { FilterPipe } from './pipe/filter.pipe';
import { MaskAmountPipe } from './pipe/mask-amount.pipe';
import { CurrencyFormatPipe } from './pipe/currency-format.pipe';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { InvestmentPageComponent } from './investment-page/investment-page.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { StatementPageComponent } from './statement-page/statement-page.component';
import { InvestmentSubtypePageComponent } from './investment-subtype-page/investment-subtype-page.component';
import { AccountComponent } from './side-menu/account/account.component';
import { SettingComponent } from './side-menu/setting/setting.component';
import { DashboardComponent } from './side-menu/dashboard/dashboard.component';

import { HttpClientModule } from '@angular/common/http';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { BackgroundMode } from '@awesome-cordova-plugins/background-mode/ngx';

import { NgApexchartsModule } from "ng-apexcharts";

import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent,
    LoginPageComponent,
    InvestmentPageComponent,
    InvestmentSubtypePageComponent,
    StatementPageComponent,
    FilterPipe,
    MaskAmountPipe,
    CurrencyFormatPipe,
    AccountComponent,
    SettingComponent,
    DashboardComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    NgApexchartsModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    BrowserAnimationsModule
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, 
    InAppBrowser, 
    BackgroundMode, 
    DecimalPipe,
  ],

  bootstrap: [AppComponent],
})
export class AppModule { }
