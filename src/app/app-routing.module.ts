import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
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
  LOGIN,
  SWIPER_VIEWER,
  DCONFIG,
} from 'src/consts/url-consts';

import { LoginComponent } from './login/login.component';
import { AuthGuard } from './login/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./alerts/alerts.module').then((m) => m.AlertsModule),
    canActivate: [AuthGuard],
  },
  {
    path: COINS,
    loadChildren: () =>
      import('./coins/coins.module').then((m) => m.CoinsModule),
    canActivate: [AuthGuard],
  },
  {
    path: VWAP_TRIGGERED_ALERTS,
    loadChildren: () =>
      import('./vwap-triggered-alerts/vwap-triggered-alerts.module').then(
        (m) => m.VwapTriggeredAlertsModule
      ),
    canActivate: [AuthGuard],
  },
  {
    path: LOGIN,
    loadChildren: () =>
      import('./login/login.module').then((m) => m.LoginModule),
  },
  {
    path: VWAP_ARCHIVED_ALERTS,
    loadChildren: () =>
      import('./vwap-archived-alerts/vwap-archived-alerts.module').then(
        (m) => m.VwapArchivedAlertsModule
      ),
    canActivate: [AuthGuard],
  },
  {
    path: VWAP_ALERTS_AT_WORK,
    loadChildren: () =>
      import('./vwap-alerts/vwap-alerts.module').then(
        (m) => m.VwapAlertsModule
      ),
    canActivate: [AuthGuard],
  },
  {
    path: LINE_LIGHTWEIGHT_CHART,
    loadChildren: () =>
      import('./line-lightweight-chart/line-lightweight-chart.module').then(
        (m) => m.LineLightweightChartModule
      ),
    canActivate: [AuthGuard],
  },
  {
    path: EXCHANGES,
    loadChildren: () =>
      import('./exchanges/exchanges.module').then((m) => m.ExchangesModule),
    canActivate: [AuthGuard],
  },
  {
    path: ALERTS_AT_WORK,
    loadChildren: () =>
      import('./alerts/alerts.module').then((m) => m.AlertsModule),
    canActivate: [AuthGuard],
  },
  {
    path: ALERTS_BATCH,
    loadChildren: () =>
      import('./alerts-batch/alerts-batch.module').then(
        (m) => m.AlertsBatchModule
      ),
    canActivate: [AuthGuard],
  },
  {
    path: TRIGGERED_ALERTS,
    loadChildren: () =>
      import('./triggered-alerts/triggered-alerts.module').then(
        (m) => m.TriggeredAlertsModule
      ),
    canActivate: [AuthGuard],
  },
  {
    path: ARCHIVED_ALERTS,
    loadChildren: () =>
      import('./archived-alerts/archived-alerts.module').then(
        (m) => m.ArchivedAlertsModule
      ),
    canActivate: [AuthGuard],
  },
  {
    path: WORK,
    loadChildren: () => import('./work/work.module').then((m) => m.WorkModule),
    canActivate: [AuthGuard],
  },
  {
    path: DCONFIG,
    loadChildren: () =>
      import('./d-config/d-config.module').then((m) => m.DConfigModule),
    canActivate: [AuthGuard],
  },
  {
    path: VWAP_LIGHTWEIGHT_CHART,
    loadChildren: () =>
      import('./vwap-lightweight-chart/vwap-lightweight-chart.module').then(
        (m) => m.VwapLightweightChartModule
      ),
    canActivate: [AuthGuard],
  },
  {
    path: SWIPER_VIEWER,
    loadChildren: () =>
      import('./swiper-viewer/swiper-viewer.module').then(
        (m) => m.SwiperViewerModule
      ),
    canActivate: [AuthGuard],
  },
  {
    path: '**',
    redirectTo: '',
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
