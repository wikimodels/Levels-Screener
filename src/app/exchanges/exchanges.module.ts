import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExchangesComponent } from './exchanges.component';
import { ExchangesRoutingModule } from './exchanges-routing.module';
import { ExchangeTableComponent } from './exchange-table/exchange-table.component';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
@NgModule({
  declarations: [ExchangesComponent, ExchangeTableComponent],
  imports: [
    CommonModule,
    FormsModule,
    ExchangesRoutingModule,
    MatInputModule,
    MatTableModule,
  ],
  exports: [ExchangesComponent, ExchangeTableComponent],
})
export class ExchangesModule {}
