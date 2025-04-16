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
import { ArchivedAlertsComponent } from './archived-alerts.component';
import { ArchivedAlertsRoutingModule } from './archived-alerts-routing.module';
import { ArchivedTableComponent } from './archived-table/archived-table.component';

@NgModule({
  declarations: [ArchivedAlertsComponent, ArchivedTableComponent],
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
    ArchivedAlertsRoutingModule,
    ChartsButtonsPanelModule,
  ],
  exports: [ArchivedAlertsComponent, ArchivedTableComponent],
})
export class ArchivedAlertsModule {}
