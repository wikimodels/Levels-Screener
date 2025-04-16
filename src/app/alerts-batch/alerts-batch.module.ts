import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { AlertsBatchComponent } from './alerts-batch.component';
import { AlertsBatchRoutingModule } from './alerts-batch-routing.module';
@NgModule({
  declarations: [AlertsBatchComponent],
  imports: [
    FormsModule,
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    AlertsBatchRoutingModule,
  ],
  exports: [AlertsBatchComponent],
})
export class AlertsBatchModule {}
