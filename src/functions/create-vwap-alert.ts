import { v4 as uuidv4 } from 'uuid';
import { Coin } from 'models/coin/coin';
import { VwapAlert } from 'models/vwap/vwap-alert';
import { formatToUTCString } from 'src/utils/fortmat-to-utc-str';

export function createVwapAlert(
  symbol: string,
  openTime: number,
  coin: Coin | undefined
) {
  const alert: VwapAlert = {
    id: uuidv4(),
    isActive: true,
    symbol: symbol,
    category: coin?.category || '',
    anchorTime: openTime,
    anchorTimeStr: formatToUTCString(openTime, 3), // +3 hours for local time
    creationTime: Date.now(),
    exchanges: coin?.exchanges,
    imageUrl: coin?.imageUrl,
    tvScreensUrls: [],
  };
  return alert;
}
