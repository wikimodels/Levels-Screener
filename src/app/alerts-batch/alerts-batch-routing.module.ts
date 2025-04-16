import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AlertsBatchComponent } from './alerts-batch.component';

export const alertsRoutes: Routes = [
  { path: '', component: AlertsBatchComponent },
];

@NgModule({
  imports: [RouterModule.forChild(alertsRoutes)],
  exports: [RouterModule],
})
export class AlertsBatchRoutingModule {}
