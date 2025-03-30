import { CanvasRenderer } from 'echarts/renderers';
import * as echarts from 'echarts/core';
import Marcaron from './marcaron';
import { BarChart, CandlestickChart, LineChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DataZoomComponent,
  DataZoomInsideComponent,
  DataZoomSliderComponent,
  LegendComponent,
  ToolboxComponent,
} from 'echarts/components';
import { NgxEchartsModule } from 'ngx-echarts';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { AlertsTableComponent } from './alerts/alerts-table/alerts-table.component';
import { AlertsComponent } from './alerts/alerts.component';
import { ImageModalComponent } from './alerts/image-modal/image-modal.component';
import { NewAlertComponent } from './alerts/new-alert/new-alert.component';
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
import { KlineChartComponent } from './kline-chart/kline-chart.component';
import { ChartComponent } from './kline-chart/chart/chart.component';
import { VwapAlertsComponent } from './vwap-alerts/vwap-alerts.component';

import { VwapAlertsTableComponent } from './vwap-alerts/vwap-alerts-table/vwap-alerts-table.component';
import { VwapArchivedAlertsComponent } from './vwap-archived-alerts/vwap-archived-alerts.component';
import { VwapArchivedTableComponent } from './vwap-archived-alerts/vwap-archived-table/vwap-archived-table.component';
import { VwapTriggeredAlertsComponent } from './vwap-triggered-alerts/vwap-triggered-alerts.component';
import { VwapTriggeredAlertsTableComponent } from './vwap-triggered-alerts/vwap-triggered-alerts-table/vwap-triggered-alerts-table.component';
import { VwapAlertMenuComponent } from './nav-bar/vwap-alert-menu/vwap-alert-menu.component';
import { EditVwapAlertComponent } from './shared/edit-vwap-alert/edit-vwap-alert.component';
echarts.use([
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LineChart,
  CanvasRenderer,
  BarChart,
  CandlestickChart,
  DataZoomComponent,
  DataZoomInsideComponent,
  DataZoomSliderComponent,
  ToolboxComponent,
]);
echarts.registerTheme('macarons', Marcaron);
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
    KlineChartComponent,
    ChartComponent,
    AlertsTableComponent,
    VwapAlertsComponent,
    VwapAlertsTableComponent,

    VwapArchivedAlertsComponent,
    VwapArchivedTableComponent,
    VwapTriggeredAlertsComponent,
    VwapTriggeredAlertsTableComponent,
    VwapAlertMenuComponent,
    EditVwapAlertComponent,
  ],
  imports: [
    FormsModule,
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    AppMaterialModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    NgxEchartsModule.forRoot({ echarts }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
