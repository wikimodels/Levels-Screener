import { UTCTimestamp } from 'lightweight-charts';

export interface SafeCandleData {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
  baseVolume: number;
  quoteVolume: number;
}
