import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AlertsComponent } from './alerts/alerts.component';
import {
  TRIGGERED_ALERTS,
  ARCHIVED_ALERTS,
  ALERTS_AT_WORK,
  WORK,
  EXCHANGES,
  COINS,
  KLINE_CHART,
  VWAP_ALERTS_AT_WORK,
  VWAP_ARCHIVED_ALERTS,
  VWAP_TRIGGERED_ALERTS,
  LIGHTWEIGHT_CHART,
} from 'src/consts/url-consts';
import { TriggeredAlertsComponent } from './triggered-alerts/triggered-alerts.component';
import { ArchivedAlertsComponent } from './archived-alerts/archived-alerts.component';
import { WorkComponent } from './work/work.component';
import { ExchangesComponent } from './exchanges/exchanges.component';
import { CoinsComponent } from './coins/coins.component';
import { LightweightChartComponent } from './lightweight-chart/lightweight-chart.component';
// Import other components as needed
import { VwapAlertsComponent } from './vwap-alerts/vwap-alerts.component';
import { VwapArchivedAlertsComponent } from './vwap-archived-alerts/vwap-archived-alerts.component';
import { VwapTriggeredAlertsComponent } from './vwap-triggered-alerts/vwap-triggered-alerts.component';
// Import your route constants

const routes: Routes = [
  { path: '', component: AlertsComponent },
  { path: COINS, component: CoinsComponent },
  {
    path: VWAP_TRIGGERED_ALERTS,
    component: VwapTriggeredAlertsComponent,
  },
  { path: VWAP_ARCHIVED_ALERTS, component: VwapArchivedAlertsComponent },
  { path: VWAP_ALERTS_AT_WORK, component: VwapAlertsComponent },
  { path: EXCHANGES, component: ExchangesComponent },
  { path: ALERTS_AT_WORK, component: AlertsComponent },
  { path: TRIGGERED_ALERTS, component: TriggeredAlertsComponent },
  { path: ARCHIVED_ALERTS, component: ArchivedAlertsComponent },
  { path: WORK, component: WorkComponent },
  { path: LIGHTWEIGHT_CHART, component: LightweightChartComponent },
  { path: '**', redirectTo: '' },
  // Your existing routes
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
