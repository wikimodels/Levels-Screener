import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// Material Modules
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatSnackBarModule } from '@angular/material/snack-bar'; // Added for snackbar errors

// Components
import { CoinsComponent } from './coins.component';
import { CoinsFieldComponent } from './coins-field/coins-field.component';
import { SharedModule } from '../shared/shared.module';
import { CoinsRoutingModule } from './coins-routing.module';

@NgModule({
  declarations: [CoinsComponent, CoinsFieldComponent],
  imports: [
    // Angular Core Modules
    CommonModule, // Provides *ngIf, *ngFor
    ReactiveFormsModule, // For reactive forms

    // Material Modules
    MatFormFieldModule, // For <mat-form-field>
    MatInputModule, // For <input matInput>
    MatAutocompleteModule, // For <mat-autocomplete>
    MatIconModule, // For <mat-icon>
    MatCheckboxModule, // For <mat-checkbox>
    MatOptionModule, // For <mat-option>
    MatSnackBarModule, // For MatSnackBar service

    // App Modules
    SharedModule, // Contains shared components/directives
    CoinsRoutingModule, // Routing configuration
  ],
  exports: [
    CoinsComponent, // Only if used in other modules
  ],
})
export class CoinsModule {}
