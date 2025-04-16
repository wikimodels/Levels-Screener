import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { VwapLightweightChartComponent } from './vwap-lightweight-chart.component';
import { VwapLightweightChartRoutingModule } from './vwap-lightweight-chart-routing.module';

@NgModule({
  declarations: [VwapLightweightChartComponent],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    VwapLightweightChartRoutingModule,
  ],
  exports: [VwapLightweightChartComponent],
})
export class VwapLightweightChartModule {}
