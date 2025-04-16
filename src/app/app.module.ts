import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppMaterialModule } from './material.module';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { CarouselComponent } from './shared/carousel/carousel.component';
import { DescriptionModalComponent } from './shared/description-modal/description-modal.component';
import { EditAlertComponent } from './shared/edit-alert/edit-alert.component';
import { SnackbarComponent } from './shared/snackbar/snackbar.component';
import { SpinnerComponent } from './shared/spinner/spinner.component';
import { TvListComponent } from './shared/tv-list/tv-list.component';
import { ValidationSummaryComponent } from './shared/validation-summary/validation-summary.component';
import { AlertMenuComponent } from './nav-bar/alert-menu/alert-menu.component';

import { CoinsComponent } from './coins/coins.component';
import { CoinsFieldComponent } from './coins/coins-field/coins-field.component';

import { VwapAlertMenuComponent } from './nav-bar/vwap-alert-menu/vwap-alert-menu.component';
import { EditVwapAlertComponent } from './shared/edit-vwap-alert/edit-vwap-alert.component';

import { BaseChartDrawingService } from 'src/service/kline/base-chart-drawing.service';
import { AdminPanelMenuComponent } from './nav-bar/admin-panel-menu/admin-panel-menu.component';
import { NewAlertComponent } from './new-alert/new-alert.component';

import { UserProfileComponent } from './nav-bar/user-profile/user-profile.component';
import { ExchangesModule } from './exchanges/exchanges.module';
import { AlertsBatchModule } from './alerts-batch/alerts-batch.module';
import { AlertsModule } from './alerts/alerts.module';
import { ArchivedAlertsModule } from './archived-alerts/archived-alerts.module';
import { TriggeredAlertsModule } from './triggered-alerts/triggered-alerts.module';
import { VwapArchivedAlertsModule } from './vwap-archived-alerts/vwap-archived-alerts.module';
import { VwapAlertsModule } from './vwap-alerts/vwap-alerts.module';
import { VwapTriggeredAlertsModule } from './vwap-triggered-alerts/vwap-triggered-alerts.module';
import { LineLightweightChartModule } from './line-lightweight-chart/line-lightweight-chart.module';
import { VwapLightweightChartModule } from './vwap-lightweight-chart/vwap-lightweight-chart.module';
import { WorkModule } from './work/work.module';

@NgModule({
  declarations: [
    AppComponent,
    NewAlertComponent,

    NavBarComponent,
    CarouselComponent,
    DescriptionModalComponent,
    EditAlertComponent,
    SnackbarComponent,
    SpinnerComponent,
    TvListComponent,
    ValidationSummaryComponent,

    AlertMenuComponent,
    CoinsComponent,
    CoinsFieldComponent,

    VwapAlertMenuComponent,
    EditVwapAlertComponent,

    //ChartsButtonsPanelComponent,
    AdminPanelMenuComponent,

    UserProfileComponent,
  ],
  imports: [
    FormsModule,
    BrowserModule,
    HttpClientModule,
    AlertsModule,
    ArchivedAlertsModule,
    AlertsBatchModule,
    TriggeredAlertsModule,
    AppRoutingModule,
    AppMaterialModule,
    ExchangesModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    VwapAlertsModule,
    VwapArchivedAlertsModule,
    VwapTriggeredAlertsModule,
    LineLightweightChartModule,
    VwapLightweightChartModule,
    WorkModule,
  ],
  providers: [BaseChartDrawingService],
  bootstrap: [AppComponent],
})
export class AppModule {}
