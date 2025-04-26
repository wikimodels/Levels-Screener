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
import { AlertsComponent } from './alerts.component';
import { AlertsTableComponent } from './alerts-table/alerts-table.component';
import { AlertsRoutingModule } from './alerts-routing.module';
import { ChartsButtonsPanelModule } from '../shared/charts-buttons-panel/charts-buttons-panel.module';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { SwiperViewerModule } from '../swiper-viewer/swiper-viewer.module';

@NgModule({
  declarations: [AlertsComponent, AlertsTableComponent],
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
    AlertsRoutingModule,
    ChartsButtonsPanelModule,
    MatSlideToggleModule,
    SwiperViewerModule,
  ],
  exports: [AlertsComponent, AlertsTableComponent],
})
export class AlertsModule {}
