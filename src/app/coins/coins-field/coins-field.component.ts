import { Component, Input, OnInit } from '@angular/core';
import { Coin } from 'models/coin/coin';
import { CoinsGenericService } from 'src/service/coins/coins-generic.service';

@Component({
  selector: 'app-coins-field',
  templateUrl: './coins-field.component.html',
  styleUrls: ['./coins-field.component.css'],
})
export class CoinsFieldComponent implements OnInit {
  @Input() coins!: Coin[];
  constructor() {}
  ngOnInit(): void {}
}
