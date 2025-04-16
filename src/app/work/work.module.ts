import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// Angular Material Modules
import { MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';

// Custom Components
import { WorkComponent } from './work.component';
import { WorkItemComponent } from '../shared/work-item/work-item.component';
import { WorkFieldComponent } from './work-field/work-field.component';
import { ChartsButtonsPanelModule } from '../shared/charts-buttons-panel/charts-buttons-panel.module';
import { WorkRoutingModule } from './work-routing.module';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [WorkComponent, WorkFieldComponent],
  imports: [
    // Angular Core Modules
    CommonModule,
    ReactiveFormsModule,
    SharedModule,

    // Angular Material Modules
    MatRippleModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    MatTooltipModule,
    WorkRoutingModule,
    // Custom Modules
    ChartsButtonsPanelModule,
  ],
  exports: [WorkComponent],
})
export class WorkModule {}
