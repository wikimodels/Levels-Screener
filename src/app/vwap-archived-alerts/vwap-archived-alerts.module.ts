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
import { VwapArchivedAlertsRoutingModule } from './vwap-archived-alerts-routing.module';
import { VwapArchivedAlertsComponent } from './vwap-archived-alerts.component';
import { VwapArchivedTableComponent } from './vwap-archived-table/vwap-archived-table.component';

@NgModule({
  declarations: [VwapArchivedAlertsComponent, VwapArchivedTableComponent],
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
    VwapArchivedAlertsRoutingModule,
    ChartsButtonsPanelModule,
  ],
  exports: [VwapArchivedAlertsComponent, VwapArchivedTableComponent],
})
export class VwapArchivedAlertsModule {}
