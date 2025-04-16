import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VwapLightweightChartComponent } from './vwap-lightweight-chart.component';

export const routes: Routes = [
  { path: '', component: VwapLightweightChartComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VwapLightweightChartRoutingModule {}
