import { Component, Input } from '@angular/core';
import { Coin } from 'models/coin/coin';

@Component({
  selector: 'app-coins-field',
  templateUrl: './coins-field.component.html',
  styleUrls: ['./coins-field.component.css'],
})
export class CoinsFieldComponent {
  @Input() coins!: Coin[];
  constructor() {}
}
