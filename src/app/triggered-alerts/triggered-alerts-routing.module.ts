import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TriggeredAlertsComponent } from './triggered-alerts.component';

export const alertsRoutes: Routes = [
  { path: '', component: TriggeredAlertsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(alertsRoutes)],
  exports: [RouterModule],
})
export class TriggeredAlertsRoutingModule {}
