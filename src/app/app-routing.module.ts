import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LightweightChartComponent } from './lightweight-chart/lightweight-chart.component';
// Import other components as needed

// Import your route constants
import { LIGHTWEIGHT_CHART } from 'src/consts/url-consts';

const routes: Routes = [
  // Your existing routes
  { path: LIGHTWEIGHT_CHART, component: LightweightChartComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
