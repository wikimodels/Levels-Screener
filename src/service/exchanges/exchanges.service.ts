import { Coin } from 'models/coin/coin';

function groupCoinsByExchange(coins: Coin[]): Record<string, Coin[]> {
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
