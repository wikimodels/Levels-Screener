import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ChartsButtonsPanelModule } from '../shared/charts-buttons-panel/charts-buttons-panel.module';
import { VwapAlertsTableComponent } from './vwap-alerts-table/vwap-alerts-table.component';
import { VwapAlertsComponent } from './vwap-alerts.component';
import { VwapAlertsRoutingModule } from './vwap-alerts-routing.module';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@NgModule({
  declarations: [VwapAlertsComponent, VwapAlertsTableComponent],
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatInputModule,
    MatFormFieldModule,
    VwapAlertsRoutingModule,
    ChartsButtonsPanelModule,
    MatSlideToggleModule,
  ],
  exports: [VwapAlertsComponent, VwapAlertsTableComponent],
})
export class VwapAlertsModule {}
