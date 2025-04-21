import { UTCTimestamp } from 'lightweight-charts';
import { KlineData } from 'src/app/models/kline/kline-data';
import { VwapAlert } from 'src/app/models/vwap/vwap-alert';

export function calculateVwapLinesForAlerts(
  alerts: VwapAlert[],
  klineData: KlineData[]
): { time: UTCTimestamp; value: number }[][] {
  if (!klineData || klineData.length === 0) {
    console.error('[VWAP] No Kline data available for VWAP calculation');
    return [];
  }

  // Ensure Kline data is sorted by time
  klineData.sort((a, b) => a.openTime - b.openTime);

  const vwapLines: { time: UTCTimestamp; value: number }[][] = [];

  alerts.forEach((alert) => {
    if (typeof alert.anchorTime !== 'number' || isNaN(alert.anchorTime)) {
      console.warn(`[VWAP] Invalid anchorTime for alert ID: ${alert.id}`);
      return;
    }

    // Find the starting index in Kline data
    const startIndex = klineData.findIndex(
      (kline) => Number(kline.openTime) === Number(alert.anchorTime)
    );

    if (startIndex === -1) {
      console.warn(
        `[VWAP] No matching Kline data for anchorTime: ${alert.anchorTime}`
      );
      return;
    }

    let cumulativePV = 0;
    let cumulativeVolume = 0;

    const vwapData: { time: UTCTimestamp; value: number }[] = [];

    klineData.slice(startIndex).forEach((candle) => {
      const typicalPrice =
        (candle.highPrice + candle.lowPrice + candle.closePrice) / 3;

      // Determine volume (quoteVolume or baseVolume)
      let volume = 0;
      if (
        typeof candle.quoteVolume === 'number' &&
        !isNaN(candle.quoteVolume) &&
        candle.quoteVolume > 0
      ) {
        volume = candle.quoteVolume;
      } else if (
        typeof candle.baseVolume === 'number' &&
        !isNaN(candle.baseVolume) &&
        candle.baseVolume > 0
      ) {
        volume = candle.baseVolume * typicalPrice;
      } else {
        console.warn(
          `[VWAP] No valid volume for candle at time: ${candle.openTime}`
        );
        return; // Skip this candle
      }

      if (volume > 0) {
        cumulativePV += typicalPrice * volume;
        cumulativeVolume += volume;
      }

      // Calculate VWAP value
      const vwapValue =
        cumulativeVolume > 0
          ? parseFloat((cumulativePV / cumulativeVolume).toFixed(8)) // Round to 8 decimal places
          : 0;

      // Push VWAP point with correct time format
      const adjustedTime = Math.floor(candle.openTime / 1000) + 3 * 60 * 60;
      vwapData.push({
        time: adjustedTime as UTCTimestamp, // Convert to seconds
        value: vwapValue,
      });
    });

    if (vwapData.length > 0) {
      vwapLines.push(vwapData);
    }
  });

  return vwapLines;
}
