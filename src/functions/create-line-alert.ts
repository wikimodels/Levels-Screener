import { v4 as uuidv4 } from 'uuid';
import { Coin } from 'src/app/models/coin/coin';
import { Alert } from 'src/app/models/alerts/alert';
import { getAlertName } from './get-alert-name';

export function createLineAlert(
  symbol: string,
  price: number,
  coin: Coin | undefined
) {
  const alert: Alert = {
    id: uuidv4(),
    action: 'Line Cross',
    alertName: '*' + getAlertName(symbol, price),
    isActive: true,
    symbol: symbol,
    category: coin?.category || '',
    price: price,
    creationTime: Date.now(),
    exchanges: coin?.exchanges,
    imageUrl: coin?.imageUrl,
    tvScreensUrls: [],
    description: 'Line Cross',
    status: 'undefined',
  };
  return alert;
}
