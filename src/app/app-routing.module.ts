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
  VWAP,
  KLINE_CHART,
} from 'src/consts/url-consts';
import { TriggeredAlertsComponent } from './triggered-alerts/triggered-alerts.component';
import { ArchivedAlertsComponent } from './archived-alerts/archived-alerts.component';
import { WorkComponent } from './work/work.component';
import { ExchangesComponent } from './exchanges/exchanges.component';
import { CoinsComponent } from './coins/coins.component';
import { VwapComponent } from './vwap/vwap.component';
import { KlineChartComponent } from './kline-chart/kline-chart.component';

const routes: Routes = [
  { path: '', component: AlertsComponent },
  { path: KLINE_CHART, component: KlineChartComponent },
  { path: COINS, component: CoinsComponent },
  { path: VWAP, component: VwapComponent },
  { path: EXCHANGES, component: ExchangesComponent },
  { path: ALERTS_AT_WORK, component: AlertsComponent },
  { path: TRIGGERED_ALERTS, component: TriggeredAlertsComponent },
  { path: ARCHIVED_ALERTS, component: ArchivedAlertsComponent },
  { path: WORK, component: WorkComponent },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
