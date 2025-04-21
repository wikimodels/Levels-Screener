import { CandlestickData, UTCTimestamp } from 'lightweight-charts';
import { KlineData } from 'src/app/models/kline/kline-data';

export function transformToCandlestickData(
  klineData: KlineData[]
): CandlestickData[] {
  const klineDataCopy = [...klineData]; // Create a shallow copy to avoid side effects

  // Filter out invalid entries
  const filteredData = klineDataCopy.filter(
    (kline) =>
      typeof kline.openTime === 'number' &&
      kline.openTime > 0 &&
      typeof kline.openPrice === 'number' &&
      typeof kline.highPrice === 'number' &&
      typeof kline.lowPrice === 'number' &&
      typeof kline.closePrice === 'number'
  );

  if (filteredData.length === 0) {
    console.warn('No valid KlineData after filtering');
    return [];
  }

  // Transform into candlestick format
  const candlestickData = filteredData.map((kline) => ({
    time: (Math.floor(kline.openTime / 1000) + 3 * 60 * 60) as UTCTimestamp, // Adjust for UTC offset
    open: kline.openPrice,
    high: kline.highPrice,
    low: kline.lowPrice,
    close: kline.closePrice,
  }));

  return candlestickData;
}
