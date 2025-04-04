import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  UTCTimestamp,
} from 'lightweight-charts';
import { TWKlineService } from 'src/service/kline/tw-kline.service';
import { SnackbarService } from 'src/service/snackbar.service';
import { SnackbarType } from 'models/shared/snackbar-type';
import { KlineData } from 'models/kline/kline-data';
import { ActivatedRoute } from '@angular/router';
import { SafeCandleData } from 'models/chart/safe-candle-data';

@Component({
  selector: 'app-lightweight-chart',
  templateUrl: './lightweight-chart.component.html',
  styleUrls: ['./lightweight-chart.component.css', './../../styles-alerts.css'],
})
export class LightweightChartComponent implements OnInit {
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;
  isRotating = false;
  symbol!: string;
  imageUrl!: string;
  category!: string;
  private chart!: IChartApi;
  private klineData: KlineData[] = [];
  private candlestickSeries!: ISeriesApi<'Candlestick'>;
  private candleData: SafeCandleData[] = [];
  private vwapLines: Map<
    UTCTimestamp,
    {
      series: ISeriesApi<'Line'>;
      data: { time: UTCTimestamp; value: number }[];
    }
  > = new Map();

  constructor(
    private route: ActivatedRoute,
    private klineService: TWKlineService,
    private snackBarService: SnackbarService
  ) {}

  ngOnInit(): void {
    window.scrollTo(0, 0);
    const params = this.route.snapshot.queryParams;
    this.symbol = params['symbol'];
    this.imageUrl = params['imageUrl'];
    this.category = params['category'];

    this.initChart();
    this.loadChartData();
    this.setupClickHandler();
    this.setupHoverHandler();
  }

  private initChart(): void {
    this.chart = createChart(this.chartContainer.nativeElement, {
      width: 1200,
      height: 460,
      layout: {
        background: { color: '#F5F5F5' }, // Light gray background [[1]][[8]]
        textColor: '#333333', // Dark gray text for contrast [[6]][[8]]
      },
      grid: {
        vertLines: { color: '#E0E0E0' }, // Light gray vertical grid lines [[3]][[7]]
        horzLines: { color: '#E0E0E0' }, // Light gray horizontal grid lines [[3]][[7]]
      },
      crosshair: {
        mode: 1, // Normal crosshair mode
        vertLine: {
          width: 1,
          color: 'rgba(0, 0, 0, 0.3)', // Semi-transparent black crosshair [[1]][[8]]
          style: 0,
          labelBackgroundColor: '#555555', // Darker gray label background [[3]]
        },
        horzLine: {
          width: 1,
          color: 'rgba(0, 0, 0, 0.3)', // Semi-transparent black crosshair [[1]][[8]]
          style: 0,
          labelBackgroundColor: '#555555', // Darker gray label background [[3]]
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
      upColor: '#FFFFFF', // White for bullish candles [[8]]
      downColor: '#000000', // Black for bearish candles [[8]]
      borderVisible: true, // Show borders [[8]]
      borderColor: '#000000', // Black borders [[8]]
      wickUpColor: '#000000', // Black wicks for up candles [[8]]
      wickDownColor: '#000000', // Black wicks for down candles [[8]]
    });

    this.chart.timeScale().fitContent();
  }

  refreshChartData() {
    this.loadChartData();
  }

  private loadChartData(): void {
    this.isRotating = true;
    this.klineService
      .fetchCombinedChartData(this.symbol, 'm15', 400)
      .subscribe(({ candlestick, vwapLines, klineData }) => {
        // Clear existing data
        this.isRotating = false;
        this.klineData = klineData;
        this.candleData = (candlestick as SafeCandleData[]).filter(
          (c) => !isNaN(c.time) && c.time > 0
        );
        this.clearAllVWAPs();

        if (this.candleData.length === 0) {
          console.error('No valid candle data available - detailed debug:');
          console.log('Raw API response:', { candlestick, vwapLines });
          // Handle both string and number timestamps
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
          console.log(
            'First 5 invalid items:',
            candlestick.slice(0, 5).map((c: CandlestickData) => ({
              time: c.time,
              type: typeof c.time,
              valid: toValidTimestamp(c.time) !== null,
            }))
          );

          this.snackBarService.showSnackBar(
            `No valid chart data (${candlestick.length} items, all invalid)`,
            'Check console for details',
            6000,
            SnackbarType.Error
          );
          return;
        }

        // Verify data is ordered by time
        const isOrdered = this.candleData.every(
          (c, i, arr) => i === 0 || c.time > arr[i - 1].time
        );

        if (!isOrdered) {
          console.error('Candle data is not properly ordered by time');
          this.candleData.sort((a, b) => a.time - b.time);
        }

        // Set candlestick data
        this.candlestickSeries.setData(this.candleData);

        //Add all VWAP lines
        vwapLines.forEach(
          (vwapData: { time: UTCTimestamp; value: number }[]) => {
            if (vwapData.length > 1) {
              const color = this.getRandomVWAPColor();
              const series = this.chart.addLineSeries({
                color,
                lineWidth: 2,
                crosshairMarkerVisible: true,
                priceLineVisible: false, // Disable price labels on the scale
                lastValueVisible: false, // Disable last value display
              });
              series.setData(vwapData);

              // Store reference to the series and its data
              this.vwapLines.set(vwapData[0].time, {
                series,
                data: vwapData,
              });
            }
          }
        );

        this.chart.timeScale().fitContent();
      });
  }

  private clearAllVWAPs(): void {
    this.vwapLines.forEach(({ series }) => this.chart.removeSeries(series));
    this.vwapLines.clear();
  }

  private setupHoverHandler(): void {
    this.chart.subscribeCrosshairMove((param) => {
      if (!param.time) return;

      const hoveredTime = param.time as UTCTimestamp;
      const hoveredCandle = this.candleData.find((c) => c.time === hoveredTime);

      if (hoveredCandle) {
        // Update crosshair labels with detailed time
        this.chart.applyOptions({
          crosshair: {
            horzLine: {
              labelVisible: true,
            },
            vertLine: {
              labelVisible: true,
            },
          },
        });
      }
    });
  }

  private calculateVWAP(
    startIndex: number
  ): { time: UTCTimestamp; value: number }[] {
    console.log('[VWAP] Starting calculation from index:', startIndex);

    if (!this.candleData || this.candleData.length === 0) {
      console.error('[VWAP] No candle data available');
      return [];
    }
    if (startIndex < 0 || startIndex >= this.candleData.length) {
      console.error('[VWAP] Invalid startIndex:', startIndex);
      return [];
    }

    let cumulativeVolume = 0;
    let cumulativePV = 0;
    const vwapData: { time: UTCTimestamp; value: number }[] = [];

    for (let i = startIndex; i < this.candleData.length; i++) {
      const candle = this.candleData[i];
      const typicalPrice = (candle.high + candle.low + candle.close) / 3;
      let volume = 0;

      if (
        typeof candle.quoteVolume === 'number' &&
        !isNaN(candle.quoteVolume)
      ) {
        volume = candle.quoteVolume;
      } else if (
        typeof candle.baseVolume === 'number' &&
        !isNaN(candle.baseVolume)
      ) {
        volume = candle.baseVolume * typicalPrice;
      } else {
        volume = typicalPrice;
      }

      if (volume > 0) {
        cumulativePV += typicalPrice * volume;
        cumulativeVolume += volume;
        const currentVWAP = cumulativePV / cumulativeVolume;

        vwapData.push({
          time: candle.time,
          value: currentVWAP,
        });
      }
    }

    console.log('[VWAP] Calculation complete. Points:', vwapData.length);
    return vwapData;
  }

  private setupClickHandler(): void {
    this.chart.subscribeClick((param) => {
      if (!param.time) return;

      const clickedTime = param.time as UTCTimestamp; // This is in milliseconds
      const clickedIndex = this.candleData.findIndex(
        (c) => c.time === clickedTime
      );
      console.log('Clicked index:', clickedIndex);
      if (clickedIndex < 0) return;

      // Convert clickedTime to Unix timestamp (in seconds)
      const unixTimestamp = this.klineData[clickedIndex].openTime;

      if (this.vwapLines.has(clickedTime)) {
        // Remove existing VWAP line and delete anchor
        const vwapLine = this.vwapLines.get(clickedTime);
        if (vwapLine) {
          this.chart.removeSeries(vwapLine.series);
          this.vwapLines.delete(clickedTime);

          // Call delete service with Unix timestamp
          this.klineService
            .deleteAnchorPoint(this.symbol, unixTimestamp)
            .subscribe({
              next: () => {
                console.log('Anchor deleted successfully');
                // Optional: Add notification
              },
              error: (err) => {
                console.error('Delete failed:', err);
                // Optional: Show error
              },
            });
        }
      } else {
        // Add new VWAP line and save anchor
        const vwapData = this.calculateVWAP(clickedIndex);
        if (vwapData.length > 1) {
          const color = this.getRandomVWAPColor();
          const series = this.chart.addLineSeries({
            color,
            lineWidth: 2,
            crosshairMarkerVisible: true,
            priceLineVisible: false, // Disable price labels on the scale
            lastValueVisible: false, // Disable last value display
          });

          series.setData(vwapData);
          this.vwapLines.set(clickedTime, { series, data: vwapData });

          // Call save service with Unix timestamp
          this.klineService
            .saveAnchorPoint(this.symbol, unixTimestamp)
            .subscribe({
              next: (response) => {
                console.log('Anchor saved successfully:', response);
                // Optional: Add success notification
              },
              error: (err) => {
                console.error('Error saving anchor:', err);
                // Optional: Add error notification
              },
            });
        }
      }
    });
  }

  private getRandomVWAPColor(): string {
    const colors = [
      '#FF0000', // Red
      '#00FF00', // Lime
      '#FFFF00', // Yellow
      '#FFA500', // Orange
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}
