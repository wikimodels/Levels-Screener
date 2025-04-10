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
  VWAP_ALERTS_AT_WORK,
  VWAP_ARCHIVED_ALERTS,
  VWAP_TRIGGERED_ALERTS,
  VWAP_LIGHTWEIGHT_CHART,
  ALERTS_BATCH,
  LINE_LIGHTWEIGHT_CHART,
} from 'src/consts/url-consts';
import { TriggeredAlertsComponent } from './triggered-alerts/triggered-alerts.component';
import { ArchivedAlertsComponent } from './archived-alerts/archived-alerts.component';
import { WorkComponent } from './work/work.component';
import { ExchangesComponent } from './exchanges/exchanges.component';
import { CoinsComponent } from './coins/coins.component';
import { VwapLightweightChartComponent } from './vwap-lightweight-chart/vwap-lightweight-chart.component';
// Import other components as needed
import { VwapAlertsComponent } from './vwap-alerts/vwap-alerts.component';
import { VwapArchivedAlertsComponent } from './vwap-archived-alerts/vwap-archived-alerts.component';
import { VwapTriggeredAlertsComponent } from './vwap-triggered-alerts/vwap-triggered-alerts.component';
import { AlertsBatchComponent } from './alerts-batch/alerts-batch.component';
import { LineLightweightChartComponent } from './line-lightweight-chart/line-lightweight-chart.component';
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
  { path: LINE_LIGHTWEIGHT_CHART, component: LineLightweightChartComponent },
  { path: EXCHANGES, component: ExchangesComponent },
  { path: ALERTS_AT_WORK, component: AlertsComponent },
  { path: ALERTS_BATCH, component: AlertsBatchComponent },
  { path: TRIGGERED_ALERTS, component: TriggeredAlertsComponent },
  { path: ARCHIVED_ALERTS, component: ArchivedAlertsComponent },
  { path: WORK, component: WorkComponent },
  { path: VWAP_LIGHTWEIGHT_CHART, component: VwapLightweightChartComponent },
  { path: '**', redirectTo: '' },
  // Your existing routes
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
