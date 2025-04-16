import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// Angular Material Modules
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';

// Components
import { CoinsComponent } from './coins.component';
import { CoinsFieldComponent } from './coins-field/coins-field.component';
import { WorkItemComponent } from '../work/work-item/work-item.component';

@NgModule({
  declarations: [CoinsComponent, CoinsFieldComponent, WorkItemComponent],
  imports: [
    // Angular Core Modules
    CommonModule,
    ReactiveFormsModule,

    // Angular Material Modules
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatRippleModule,
  ],
  exports: [CoinsComponent, CoinsFieldComponent, WorkItemComponent],
})
export class CoinsModule {}
