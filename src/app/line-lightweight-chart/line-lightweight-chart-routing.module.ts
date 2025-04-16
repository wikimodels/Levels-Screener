import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LineLightweightChartComponent } from './line-lightweight-chart.component';

export const routes: Routes = [
  { path: '', component: LineLightweightChartComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LineLightweightChartRoutingModule {}
