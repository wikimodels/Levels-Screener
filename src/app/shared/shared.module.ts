import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Angular Material Modules
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { TextFieldModule } from '@angular/cdk/text-field';

// Components
import { CarouselComponent } from './carousel/carousel.component';
import { DescriptionModalComponent } from './description-modal/description-modal.component';
import { SnackbarComponent } from './snackbar/snackbar.component';
import { SpinnerComponent } from './spinner/spinner.component';
import { TvListComponent } from './tv-list/tv-list.component';
import { ValidationSummaryComponent } from './validation-summary/validation-summary.component';
import { WorkItemComponent } from './work-item/work-item.component';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [
    CarouselComponent,
    DescriptionModalComponent,
    SnackbarComponent,
    SpinnerComponent,
    TvListComponent,
    ValidationSummaryComponent,
    WorkItemComponent,
  ],
  imports: [
    // Angular Modules
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    // Material Modules
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatAutocompleteModule,
    MatOptionModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    TextFieldModule,
  ],
  exports: [
    // Components
    CarouselComponent,
    DescriptionModalComponent,
    SnackbarComponent,
    SpinnerComponent,
    TvListComponent,
    ValidationSummaryComponent,
    WorkItemComponent,

    // Modules
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatOptionModule,
    MatProgressSpinnerModule,
    TextFieldModule,
    MatButtonModule,
  ],
})
export class SharedModule {}
