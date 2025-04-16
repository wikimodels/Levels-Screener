import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { VwapTriggeredAlertsComponent } from './vwap-triggered-alerts.component';

export const alertsRoutes: Routes = [
  { path: '', component: VwapTriggeredAlertsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(alertsRoutes)],
  exports: [RouterModule],
})
export class VwapTriggeredAlertsRoutingModule {}
