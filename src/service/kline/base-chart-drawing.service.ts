import { ElementRef, Injectable } from '@angular/core';
import {
  UTCTimestamp,
  CandlestickData,
  LineStyle,
  createChart,
  IChartApi,
  IPriceLine,
  ISeriesApi,
} from 'lightweight-charts';
import { SafeCandleData } from 'models/chart/safe-candle-data';
import { SnackbarType } from 'models/shared/snackbar-type';
import { LineTwChartService } from './line-tw-chart.service';
import { SnackbarService } from '../snackbar.service';
import { KlineData } from 'models/kline/kline-data';

@Injectable({
  providedIn: 'root',
})
export class BaseChartDrawingService {
  //tolerance = 1.0001 if klineData[0]closePrice > $1000
  //tolerance = 1.001; if klineData[0]closePrice coins < $1000
  tolerance!: number;
  isRotating = false;
  symbol!: string;
  imageUrl!: string;
  category!: string;
  tvLink!: string;
  chart!: IChartApi;
  highlightedPrice: number | undefined;
  klineData: KlineData[] = [];
  candlestickSeries!: ISeriesApi<'Candlestick'>;
  candleData: SafeCandleData[] = [];
  globalLineColor = 'black';
  vwapLines: Map<
    UTCTimestamp,
    {
      series: ISeriesApi<'Line'>;
      data: { time: UTCTimestamp; value: number }[];
    }
  > = new Map();

  horizontalLines: Map<
    number,
    {
      line: IPriceLine;
      series: ISeriesApi<'Candlestick'>;
      data: { time: UTCTimestamp; value: number }[];
    }
  > = new Map();

  constructor(
    private lineKlineService: LineTwChartService,
    private snackBarService: SnackbarService
  ) {}

  initChart(chartContainer: ElementRef): void {
    if (!chartContainer?.nativeElement) {
      console.error('Chart container element not found');
      return;
    }

    this.chart = createChart(chartContainer.nativeElement, {
      width: 1200,
      height: 460,
      layout: {
        background: { color: '#F5F5F5' },
        textColor: '#333333',
      },
      grid: {
        vertLines: { color: '#E0E0E0' },
        horzLines: { color: '#E0E0E0' },
      },
      crosshair: {
        mode: 0,
        vertLine: {
          width: 1,
          color: 'rgba(0, 0, 0, 0.3)',
          style: 0,
          labelBackgroundColor: '#555555',
        },
        horzLine: {
          width: 1,
          color: 'rgba(0, 0, 0, 0.3)',
          style: 0,
          labelBackgroundColor: '#555555',
        },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        tickMarkFormatter: (time: number) => {
          const date = new Date(time * 1000);
          return date.toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });
        },
      },
    });

    this.candlestickSeries = this.chart.addCandlestickSeries({
      upColor: '#FFFFFF',
      downColor: '#000000',
      borderVisible: true,
      borderColor: '#000000',
      wickUpColor: '#000000',
      wickDownColor: '#000000',
    });

    this.chart.timeScale().fitContent();
  }

  loadChartData(symbol: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.chart) {
        console.error('Chart is not initialized');
        reject('Chart is not initialized');
        return;
      }

      this.isRotating = true;
      this.lineKlineService.fetchChartData(symbol, 'm15', 400).subscribe(
        ({ candlestick, vwapLines, lines, klineData }) => {
          this.isRotating = false;

          // Set klineData and validate it
          this.klineData = klineData;

          // Set tolerance based on klineData[0].closePrice
          if (
            this.klineData.length > 0 &&
            this.klineData[0].closePrice !== undefined
          ) {
            this.tolerance =
              this.klineData[0].closePrice > 1000 ? 1.0001 : 1.001;
          } else {
            console.warn(
              'Unable to determine tolerance: klineData is invalid or empty.'
            );
            this.tolerance = 1.001; // Default fallback value
          }

          // Log the tolerance for debugging
          console.log(`Tolerance set to: ${this.tolerance}`);

          // Process candle data
          this.candleData = (candlestick as SafeCandleData[]).filter(
            (c) => !isNaN(c.time) && c.time > 0
          );

          this.clearAllVWAPs();
          this.clearAllHorizontalLines();

          if (this.candleData.length === 0) {
            console.error('No valid candle data available - detailed debug:');
            console.log('Raw API response:', { candlestick, vwapLines });

            const toValidTimestamp = (t: any): UTCTimestamp | null => {
              if (typeof t === 'number' && !isNaN(t) && t > 0)
                return t as UTCTimestamp;
              if (typeof t === 'string') {
                const num = Number(t);
                return !isNaN(num) && num > 0 ? (num as UTCTimestamp) : null;
              }
              return null;
            };

            console.log(
              'Filtered candlestick data:',
              candlestick.filter(
                (c: CandlestickData) => toValidTimestamp(c.time) !== null
              )
            );

            this.snackBarService.showSnackBar(
              `No valid chart data (${candlestick.length} items, all invalid)`,
              'Check console for details',
              6000,
              SnackbarType.Error
            );
            reject('No valid chart data');
            return;
          }

          const isOrdered = this.candleData.every(
            (c, i, arr) => i === 0 || c.time > arr[i - 1].time
          );

          if (!isOrdered) {
            console.error('Candle data is not properly ordered by time');
            this.candleData.sort((a, b) => a.time - b.time);
          }

          this.candlestickSeries.setData(this.candleData);

          vwapLines.forEach(
            (vwapData: { time: UTCTimestamp; value: number }[]) => {
              if (vwapData.length > 1) {
                const color = this.getVwapRandomColor();
                const series = this.chart.addLineSeries({
                  color,
                  lineWidth: 2,
                  crosshairMarkerVisible: true,
                  priceLineVisible: false,
                  lastValueVisible: false,
                });
                series.setData(vwapData);
                this.vwapLines.set(vwapData[0].time, {
                  series,
                  data: vwapData,
                });
              }
            }
          );

          lines.forEach((lineData: { time: UTCTimestamp; value: number }[]) => {
            if (lineData.length > 1) {
              const priceLine = this.candlestickSeries.createPriceLine({
                price: lineData[0].value,
                color: this.globalLineColor,
                lineWidth: 2,
                lineStyle: LineStyle.Solid,
                axisLabelVisible: false,
              });

              this.horizontalLines.set(lineData[0].value, {
                line: priceLine,
                series: this.candlestickSeries,
                data: lineData,
              });
            }
          });

          this.chart.timeScale().fitContent();
          resolve();
        },
        (error) => {
          this.isRotating = false;
          reject(error);
        }
      );
    });
  }

  public getTolerance(): number {
    return this.tolerance;
  }

  clearAllVWAPs(): void {
    this.vwapLines.forEach(({ series }) => this.chart.removeSeries(series));
    this.vwapLines.clear();
  }

  clearAllHorizontalLines(): void {
    this.horizontalLines.forEach(({ line, series }) => {
      series.removePriceLine(line);
    });
    this.horizontalLines.clear();
  }

  getVwapRandomColor(): string {
    const colors = [
      '#FF0000', // Red
      '#00FF00', // Lime
      '#FFFF00', // Yellow
      '#FFA500', // Orange
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  destroyChart() {
    this.horizontalLines.forEach((_, price) => this.removePriceLine(price));
    this.chart.remove();
  }

  private removePriceLine(price: number): void {
    const priceLineData = this.horizontalLines.get(price);
    if (priceLineData) {
      priceLineData.series.removePriceLine(priceLineData.line);
      this.horizontalLines.delete(price);
    }
  }
}
