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

import { MatButtonModule } from '@angular/material/button';
import { SwiperModule } from 'swiper/angular';
import { ZoomViewerComponent } from './zoom-viewer/zoom-viewer.component';
import { SwiperViewerComponent } from './swiper-viewer.component';
import { SwiperViewerRoutingModule } from './swiper-viewer-routing.module';

@NgModule({
  declarations: [SwiperViewerComponent, ZoomViewerComponent],
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
    SwiperViewerRoutingModule,
    // Swiper (v8)
    SwiperModule,
  ],
  exports: [
    // Components
    SwiperViewerComponent,
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
    SwiperModule,
    SwiperViewerRoutingModule,
  ],
})
export class SwiperViewerModule {}
