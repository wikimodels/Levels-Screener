import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { ChartsButtonsPanelComponent } from './charts-buttons-panel.component';
import { NgModule } from '@angular/core';

@NgModule({
  declarations: [ChartsButtonsPanelComponent],
  imports: [MatButtonModule, MatTooltipModule, MatIconModule],
  exports: [ChartsButtonsPanelComponent],
})
export class ChartsButtonsPanelModule {}
