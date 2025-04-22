export function getAlertName(symbol: string, price: number) {
  return symbol.split('USDT')[0] + '-' + price.toString();
}
