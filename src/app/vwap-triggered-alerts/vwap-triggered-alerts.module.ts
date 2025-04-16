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
import { VwapTriggeredAlertsRoutingModule } from './vwap-triggered-alerts-routing.module';
import { VwapTriggeredAlertsComponent } from './vwap-triggered-alerts.component';
import { VwapTriggeredAlertsTableComponent } from './vwap-triggered-alerts-table/vwap-triggered-alerts-table.component';

@NgModule({
  declarations: [
    VwapTriggeredAlertsComponent,
    VwapTriggeredAlertsTableComponent,
  ],
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
    VwapTriggeredAlertsRoutingModule,
    ChartsButtonsPanelModule,
  ],
  exports: [VwapTriggeredAlertsComponent, VwapTriggeredAlertsTableComponent],
})
export class VwapTriggeredAlertsModule {}
