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
} from 'src/consts/url-consts';
import { TriggeredAlertsComponent } from './triggered-alerts/triggered-alerts.component';
import { ArchivedAlertsComponent } from './archived-alerts/archived-alerts.component';
import { WorkComponent } from './work/work.component';
import { ExchangesComponent } from './exchanges/exchanges.component';
import { CoinsComponent } from './coins/coins.component';

import { KlineChartComponent } from './kline-chart/kline-chart.component';

import { VwapAlertsComponent } from './vwap-alerts/vwap-alerts.component';
import { VwapArchivedAlertsComponent } from './vwap-archived-alerts/vwap-archived-alerts.component';
import { VwapTriggeredAlertsComponent } from './vwap-triggered-alerts/vwap-triggered-alerts.component';

const routes: Routes = [
  { path: '', component: AlertsComponent },
  { path: KLINE_CHART, component: KlineChartComponent },
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
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
