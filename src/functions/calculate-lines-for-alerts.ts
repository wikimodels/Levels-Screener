import { UTCTimestamp } from 'lightweight-charts';
import { Alert } from 'src/app/models/alerts/alert';
import { KlineData } from 'src/app/models/kline/kline-data';

export function calculateLinesForAlerts(
  alerts: Alert[],
  klineData: KlineData[]
): { time: UTCTimestamp; value: number }[][] {
  if (!klineData || klineData.length === 0) {
    console.error('[Line] No Kline data available for line calculation');
    return [];
  }

  // Ensure Kline data is sorted by time
  klineData.sort((a, b) => a.openTime - b.openTime);

  // Extract the first and last timestamps from Kline data
  const startTime = Math.floor(klineData[0].openTime / 1000) + 3 * 60 * 60; // Convert to seconds and add 3 hours
  const endTime =
    Math.floor(klineData[klineData.length - 1].openTime / 1000) + 3 * 60 * 60;

  const lines: { time: UTCTimestamp; value: number }[][] = [];

  alerts.forEach((alert) => {
    if (typeof alert.price !== 'number' || isNaN(alert.price)) {
      console.warn(`[Line] Invalid price for alert ID: ${alert.id}`);
      return;
    }

    // Create a horizontal line with two points: start and end time
    const lineData: { time: UTCTimestamp; value: number }[] = [
      { time: startTime as UTCTimestamp, value: alert.price },
      { time: endTime as UTCTimestamp, value: alert.price },
    ];

    lines.push(lineData);
  });

  return lines;
}
