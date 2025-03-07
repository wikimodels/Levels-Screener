import { Component, Input, ViewEncapsulation } from '@angular/core';
import { Coin } from 'models/coin/coin';
import { CoinLinksService } from 'src/service/coin-links.service';

@Component({
  selector: 'app-exchange-table',
  templateUrl: './exchange-table.component.html',
  styleUrls: ['./exchange-table.component.css'],
})
export class ExchangeTableComponent {
  @Input() exchanges!: Record<string, Coin[]>;
  constructor(public coinLinksService: CoinLinksService) {}
  // Helper method to safely use Object.keys
  objectKeys(obj: Record<string, Coin[]>): string[] {
    return Object.keys(obj);
  }

  searchText: { [key: string]: string } = {}; // Track search text for each exchange

  // Helper method to filter coins based on the search input
  filterCoins(coins: Coin[], search: string): Coin[] {
    if (!search) {
      return coins;
    }

    return coins.filter(
      (coin) =>
        coin.symbol.toLowerCase().includes(search.toLowerCase()) ||
        coin.category.toLowerCase().includes(search.toLowerCase())
    );
  }
}
