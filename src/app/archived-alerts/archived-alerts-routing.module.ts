import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ArchivedAlertsComponent } from './archived-alerts.component';

export const alertsRoutes: Routes = [
  { path: '', component: ArchivedAlertsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(alertsRoutes)],
  exports: [RouterModule],
})
export class ArchivedAlertsRoutingModule {}
