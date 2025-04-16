import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { AlertsTableComponent } from './alerts/alerts-table/alerts-table.component';
import { AlertsComponent } from './alerts/alerts.component';
import { ImageModalComponent } from './alerts/image-modal/image-modal.component';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component'; // ✅ Added to declarations
import { ArchivedAlertsComponent } from './archived-alerts/archived-alerts.component';
import { ArchivedTableComponent } from './archived-alerts/archived-table/archived-table.component';
import { AppMaterialModule } from './material.module';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { CarouselComponent } from './shared/carousel/carousel.component';
import { DescriptionModalComponent } from './shared/description-modal/description-modal.component';
import { EditAlertComponent } from './shared/edit-alert/edit-alert.component';
import { SnackbarComponent } from './shared/snackbar/snackbar.component';
import { SpinnerComponent } from './shared/spinner/spinner.component';
import { TvListComponent } from './shared/tv-list/tv-list.component';
import { ValidationSummaryComponent } from './shared/validation-summary/validation-summary.component';
import { TriggeredAlertsTableComponent } from './triggered-alerts/triggered-alerts-table/triggered-alerts-table.component';
import { TriggeredAlertsComponent } from './triggered-alerts/triggered-alerts.component';
import { WorkComponent } from './work/work.component';
import { WorkFieldComponent } from './work/work-field/work-field.component';
import { AlertMenuComponent } from './nav-bar/alert-menu/alert-menu.component';

import { WorkItemComponent } from './work/work-item/work-item.component';
import { ExchangesComponent } from './exchanges/exchanges.component';
import { ExchangeTableComponent } from './exchanges/exchange-table/exchange-table.component';
import { CoinsComponent } from './coins/coins.component';
import { CoinsFieldComponent } from './coins/coins-field/coins-field.component';

import { VwapAlertsComponent } from './vwap-alerts/vwap-alerts.component';

import { VwapAlertsTableComponent } from './vwap-alerts/vwap-alerts-table/vwap-alerts-table.component';
import { VwapArchivedAlertsComponent } from './vwap-archived-alerts/vwap-archived-alerts.component';
import { VwapArchivedTableComponent } from './vwap-archived-alerts/vwap-archived-table/vwap-archived-table.component';
import { VwapTriggeredAlertsComponent } from './vwap-triggered-alerts/vwap-triggered-alerts.component';
import { VwapTriggeredAlertsTableComponent } from './vwap-triggered-alerts/vwap-triggered-alerts-table/vwap-triggered-alerts-table.component';
import { VwapAlertMenuComponent } from './nav-bar/vwap-alert-menu/vwap-alert-menu.component';
import { EditVwapAlertComponent } from './shared/edit-vwap-alert/edit-vwap-alert.component';

import { AlertsBatchComponent } from './alerts-batch/alerts-batch.component';
import { VwapLightweightChartComponent } from './vwap-lightweight-chart/vwap-lightweight-chart.component';
import { LineLightweightChartComponent } from './line-lightweight-chart/line-lightweight-chart.component';
import { ChartsButtonsPanelComponent } from './shared/charts-buttons-panel/charts-buttons-panel.component';
import { BaseChartDrawingService } from 'src/service/kline/base-chart-drawing.service';
import { AdminPanelMenuComponent } from './nav-bar/admin-panel-menu/admin-panel-menu.component';
import { NewAlertComponent } from './new-alert/new-alert.component';
import { GoogleSignInComponent } from './google-sign-in/google-sign-in.component';
import { UserProfileComponent } from './nav-bar/user-profile/user-profile.component';

@NgModule({
  declarations: [
    AppComponent,
    AlertsTableComponent,
    ImageModalComponent,
    NewAlertComponent,
    AlertsComponent,
    ArchivedAlertsComponent,
    ArchivedTableComponent,
    NavBarComponent,
    CarouselComponent,
    DescriptionModalComponent,
    EditAlertComponent,
    SnackbarComponent,
    SpinnerComponent,
    TvListComponent,
    ValidationSummaryComponent,
    TriggeredAlertsComponent,
    TriggeredAlertsTableComponent,
    WorkComponent,
    WorkFieldComponent,
    WorkItemComponent,
    AlertMenuComponent,
    ExchangesComponent,
    ExchangeTableComponent,
    CoinsComponent,
    CoinsFieldComponent,

    AlertsTableComponent,
    VwapAlertsComponent,
    VwapAlertsTableComponent,

    VwapArchivedAlertsComponent,
    VwapArchivedTableComponent,
    VwapTriggeredAlertsComponent,
    VwapTriggeredAlertsTableComponent,
    VwapAlertMenuComponent,
    EditVwapAlertComponent,
    VwapLightweightChartComponent,
    AlertsBatchComponent,
    LineLightweightChartComponent,
    ChartsButtonsPanelComponent,
    AdminPanelMenuComponent,
    GoogleSignInComponent,
    UserProfileComponent,
  ],
  imports: [
    FormsModule,
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    AppMaterialModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
  ],
  providers: [BaseChartDrawingService],
  bootstrap: [AppComponent],
})
export class AppModule {}
