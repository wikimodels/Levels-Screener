import { CandlestickData, UTCTimestamp } from 'lightweight-charts';

export interface _ChartOptions {
  candlestick: CandlestickData[];
  vwapLines: { time: UTCTimestamp; value: number }[][];
}
