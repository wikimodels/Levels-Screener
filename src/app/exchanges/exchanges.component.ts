import { Subscription } from 'rxjs';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Coin } from 'models/coin/coin';
import { CoinsGenericService } from 'src/service/coins/coins-generic.service';

@Component({
  selector: 'app-exchanges',
  templateUrl: './exchanges.component.html',
  styleUrls: ['./exchanges.component.css'],
})
export class ExchangesComponent implements OnInit, OnDestroy {
  groupedCoins: Record<string, Coin[]> = {};
  coins!: Coin[];
  subscription = new Subscription();
  constructor(private coinsService: CoinsGenericService) {}
  ngOnInit(): void {
    this.subscription.add(
      this.coinsService.getAsyncCoins().subscribe((coins: Coin[]) => {
        this.groupedCoins = this.groupCoinsByExchange(coins);
      })
    );
  }

  groupCoinsByExchange(coins: Coin[]): Record<string, Coin[]> {
    return coins.reduce((acc, coin) => {
      coin.exchanges.forEach((exchange) => {
        if (!acc[exchange]) {
          acc[exchange] = [];
        }
        acc[exchange].push(coin);
      });
      return acc;
    }, {} as Record<string, Coin[]>);
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
