import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LineLightweightChartComponent } from './line-lightweight-chart.component';

@NgModule({
  declarations: [LineLightweightChartComponent],
  imports: [CommonModule, MatIconModule, MatButtonModule, MatTooltipModule],
  exports: [LineLightweightChartComponent],
})
export class LineLightweightChartModule {}
