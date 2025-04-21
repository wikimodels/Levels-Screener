import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CoinLinksService } from '../coin-links.service';
import { Coin } from 'src/app/models/coin/coin';
import {
  LINE_LIGHTWEIGHT_CHART,
  VWAP_LIGHTWEIGHT_CHART,
} from 'src/consts/url-consts';

@Injectable({
  providedIn: 'root', // Makes the service available app-wide
})
export class ChartsOpenerService {
  private openedWindows: Window[] = [];
  defaultLink = 'https://www.tradingview.com/chart?symbol=BYBIT:BTCUSDT.P';
  constructor(
    private router: Router,
    private coinsLinksService: CoinLinksService
  ) {}

  openTradingViewCharts(selectedCoins: Coin[]): void {
    this.openChartsForSelection(selectedCoins, (coin: Coin) =>
      this.coinsLinksService.tradingViewLink(coin.symbol, coin.exchanges)
    );
  }

  openCoinGlassCharts(selectedCoins: Coin[]): void {
    this.openChartsForSelection(selectedCoins, (coin: Coin) =>
      this.coinsLinksService.coinglassLink(coin.symbol, coin.exchanges)
    );
  }

  openVwapCharts(selectedCoins: Coin[]): void {
    this.openChartsForSelection(selectedCoins, (coin: Coin) =>
      this.router.createUrlTree([VWAP_LIGHTWEIGHT_CHART], {
        queryParams: {
          symbol: coin.symbol,
          category: coin.category,
          imageUrl: coin.imageUrl,
          tvLink: this.coinsLinksService.tradingViewLink(
            coin.symbol,
            coin.exchanges
          ),
        },
      })
    );
  }

  openLineCharts(selectedCoins: Coin[]): void {
    this.openChartsForSelection(selectedCoins, (coin: Coin) =>
      this.router.createUrlTree([LINE_LIGHTWEIGHT_CHART], {
        queryParams: {
          symbol: coin.symbol,
          category: coin.category,
          imageUrl: coin.imageUrl,
          tvLink: this.coinsLinksService.tradingViewLink(
            coin.symbol,
            coin.exchanges
          ),
        },
      })
    );
  }

  openDefaultTradingView(): void {
    const newWindow = window.open(this.defaultLink, '_blank');
    if (newWindow) this.openedWindows.push(newWindow);
  }

  private openChartsForSelection(
    selectedCoins: Coin[],
    getUrl: (coin: Coin) => string | any
  ): void {
    selectedCoins.forEach((coin, index) => {
      setTimeout(() => {
        const url =
          typeof getUrl(coin) === 'string'
            ? getUrl(coin)
            : this.router.serializeUrl(getUrl(coin));
        const newWindow = window.open(url, '_blank');
        if (newWindow) {
          this.openedWindows.push(newWindow);
        }
      }, index * 1500); // Delay between openings
    });
  }

  closeAllWindows(): void {
    this.openedWindows.forEach((win) => win.close());
    this.openedWindows = [];
  }
}
