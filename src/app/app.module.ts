import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFireModule } from '@angular/fire/compat';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

// Material Modules

// App Modules
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BaseChartDrawingService } from 'src/service/kline/base-chart-drawing.service';
import { AlertsBatchModule } from './alerts-batch/alerts-batch.module';
import { AlertsModule } from './alerts/alerts.module';
import { ArchivedAlertsModule } from './archived-alerts/archived-alerts.module';
import { ExchangesModule } from './exchanges/exchanges.module';
import { LineLightweightChartModule } from './line-lightweight-chart/line-lightweight-chart.module';
import { NewAlertComponent } from './new-alert/new-alert.component';
import { TriggeredAlertsModule } from './triggered-alerts/triggered-alerts.module';
import { VwapAlertsModule } from './vwap-alerts/vwap-alerts.module';
import { VwapArchivedAlertsModule } from './vwap-archived-alerts/vwap-archived-alerts.module';
import { VwapLightweightChartModule } from './vwap-lightweight-chart/vwap-lightweight-chart.module';
import { VwapTriggeredAlertsModule } from './vwap-triggered-alerts/vwap-triggered-alerts.module';
import { WorkModule } from './work/work.module';
import { AppMaterialModule } from './material.module';
import { LoginModule } from './login/login.module';
import { SharedModule } from './shared/shared.module';

import { AdminPanelMenuComponent } from './nav-bar/admin-panel-menu/admin-panel-menu.component';
import { AlertMenuComponent } from './nav-bar/alert-menu/alert-menu.component';
import { VwapAlertMenuComponent } from './nav-bar/vwap-alert-menu/vwap-alert-menu.component';
import { CoinsModule } from './coins/coins.module';

import { CoinsGenericService } from 'src/service/coins/coins-generic.service';
import { SnackbarService } from 'src/service/snackbar.service';

import { EditAlertModule } from './edit-alert/edit-alert.module';
import { EditVwapAlertModule } from './edit-vwap-alert/edit-vwap-alert.module';
import { env } from 'src/environments/environment';
// ... other component imports ...

@NgModule({
  declarations: [
    AppComponent,
    NewAlertComponent,
    NavBarComponent,
    AdminPanelMenuComponent,
    AlertMenuComponent,
    VwapAlertMenuComponent,
  ],
  imports: [
    // Angular Core Modules
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    CommonModule,
    RouterModule,
    AngularFireModule.initializeApp(env.firebaseConfig),
    AngularFireAuthModule,

    // Material Modules
    AppMaterialModule,
    // Feature Modules
    AppRoutingModule,
    ExchangesModule,
    AlertsBatchModule,
    AlertsModule,
    ArchivedAlertsModule,
    TriggeredAlertsModule,
    VwapAlertsModule,
    VwapArchivedAlertsModule,
    VwapTriggeredAlertsModule,
    LineLightweightChartModule,
    VwapLightweightChartModule,
    WorkModule,
    CoinsModule,
    LoginModule,
    //------------
    EditAlertModule,
    EditVwapAlertModule,
    // ... other modules ...
    SharedModule,
  ],
  providers: [BaseChartDrawingService, CoinsGenericService, SnackbarService],
  bootstrap: [AppComponent],
})
export class AppModule {}
