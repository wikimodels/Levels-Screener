import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VwapArchivedAlertsComponent } from './vwap-archived-alerts.component';

export const alertsRoutes: Routes = [
  { path: '', component: VwapArchivedAlertsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(alertsRoutes)],
  exports: [RouterModule],
})
export class VwapArchivedAlertsRoutingModule {}
