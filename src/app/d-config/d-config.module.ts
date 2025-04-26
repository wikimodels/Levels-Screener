import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';

import { DConfigRoutingModule } from './d-config-routing.module';
import { DConfigComponent } from './d-config.component';
@NgModule({
  declarations: [DConfigComponent],
  imports: [
    FormsModule,
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    DConfigRoutingModule,
  ],
  exports: [DConfigComponent],
})
export class DConfigModule {}
