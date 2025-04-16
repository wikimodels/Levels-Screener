import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { VwapAlertsComponent } from './vwap-alerts.component';

export const alertsRoutes: Routes = [
  { path: '', component: VwapAlertsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(alertsRoutes)],
  exports: [RouterModule],
})
export class VwapAlertsRoutingModule {}
