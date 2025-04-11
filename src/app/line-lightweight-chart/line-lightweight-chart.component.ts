import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  UTCTimestamp,
  MouseEventParams,
  LineStyle,
  IPriceLine,
} from 'lightweight-charts';

import { SnackbarService } from 'src/service/snackbar.service';
import { SnackbarType } from 'models/shared/snackbar-type';
import { KlineData } from 'models/kline/kline-data';
import { ActivatedRoute } from '@angular/router';
import { SafeCandleData } from 'models/chart/safe-candle-data';
import { LineTwChartService } from 'src/service/kline/line-tw-chart.service';
import { roundToMatchDecimals } from 'src/functions/round-to-match-decimals';

@Component({
  selector: 'app-vwap-lightweight-chart',
  templateUrl: './line-lightweight-chart.component.html',
  styleUrls: [
    './line-lightweight-chart.component.css',
    './../../styles-alerts.css',
  ],
})
export class LineLightweightChartComponent implements OnInit {
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;
  isRotating = false;
  symbol!: string;
  imageUrl!: string;
  category!: string;
  tvLink!: string;
  private chart!: IChartApi;
  private klineData: KlineData[] = [];
  private candlestickSeries!: ISeriesApi<'Candlestick'>;
  private candleData: SafeCandleData[] = [];
  private alertSeries!: ISeriesApi<'Line'>;
  private vwapLines: Map<
    UTCTimestamp,
    {
      series: ISeriesApi<'Line'>;
      data: { time: UTCTimestamp; value: number }[];
    }
  > = new Map();

  private horizontalLines: Map<number, IPriceLine> = new Map();

  constructor(
    private route: ActivatedRoute,
    private lineKlineService: LineTwChartService,
    private snackBarService: SnackbarService
  ) {}

  ngOnInit(): void {
    window.scrollTo(0, 0);

    const params = this.route.snapshot.queryParams;
    this.symbol = params['symbol'];
    this.imageUrl = params['imageUrl'];
    this.category = params['category'];
    this.tvLink = params['tvLink'];
    console.log('TVLink', this.tvLink);
    this.initChart();
    this.loadChartData();
    this.setupClickHandler();
    this.setupHoverHandler();
    this.alertSeries = this.chart.addLineSeries({
      // Optional: Make series transparent
      color: 'rgba(0,0,0,0)',
      lastValueVisible: true,
      priceLineVisible: true,
    });
  }

  private initChart(): void {
    if (!this.chartContainer?.nativeElement) {
      console.error('Chart container element not found');
      return;
    }

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
        mode: 0, // Normal crosshair mode
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

  refreshChartData(): void {
    this.loadChartData();
  }

  private loadChartData(): void {
    this.isRotating = true;
    this.lineKlineService
      .fetchCombinedChartData(this.symbol, 'm15', 400)
      .subscribe(({ candlestick, vwapLines, lines, klineData }) => {
        // Clear existing data
        this.isRotating = false;
        this.klineData = klineData;
        this.candleData = (candlestick as SafeCandleData[]).filter(
          (c) => !isNaN(c.time) && c.time > 0
        );
        this.clearAllVWAPs();
        this.clearAllHorizontalLines();

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
              const color = this.getRandomColor();
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

        lines.forEach((lineData: { time: UTCTimestamp; value: number }[]) => {
          if (lineData.length > 1) {
            const color = this.getRandomColor(); // Generate a random color for the line
            const series = this.chart.addLineSeries({
              color,
              lineWidth: 2,
              crosshairMarkerVisible: true,
              priceLineVisible: false, // Disable price labels on the scale
              lastValueVisible: false, // Disable last value display
            });

            // Set the data for the line series
            series.setData(lineData);

            // Store reference to the series and its data
          }
        });
        this.chart.timeScale().fitContent();
      });
  }

  private clearAllVWAPs(): void {
    this.vwapLines.forEach(({ series }) => this.chart.removeSeries(series));
    this.vwapLines.clear();
  }

  private clearAllHorizontalLines(): void {
    // d
  }

  private getRandomColor(): string {
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

  ngOnDestroy() {
    this.destroyChart();
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

  setupClickHandler() {
    this.chart.subscribeClick((params: MouseEventParams) => {
      if (!params.point) return;
      const clickedTime = params.time as UTCTimestamp;
      // Use the candlestick series to calculate the price from the Y coordinate
      const price = this.candlestickSeries.coordinateToPrice(params.point.y);
      const roundedPrice = roundToMatchDecimals(
        this.klineData[0].closePrice,
        Number(price)
      );

      if (price === null) return; // Handle edge cases
      this.addPriceLine(clickedTime, roundedPrice);
      this.chart.timeScale().fitContent();
      // if (this.horizontalLines.has(roundedPrice)) {
      //   this.removePriceLine(roundedPrice);
      // } else {
      //   this.addPriceLine(roundedPrice);
      // }
    });
  }

  private addPriceLine(time: UTCTimestamp, price: number) {
    console.log('time:', time, 'price:', price);
    const priceLine = this.candlestickSeries.createPriceLine({
      price: price,
      color: '#2962FF',
      lineWidth: 2,
      lineStyle: LineStyle.Dashed,
      axisLabelVisible: true,
    });
    // Store in Map with time as key
    this.horizontalLines.set(price, priceLine);
    console.log('horizLines', this.horizontalLines);
    this.lineKlineService.addAlertBySymbolAndPrice(this.symbol, price);
  }

  private removePriceLine(price: number) {
    // const priceLine = this.horizontalLines.get(price);
    // if (priceLine) {
    //   this.alertSeries.removePriceLine(priceLine);
    //   this.horizontalLines.delete(price);
    //   this.lineKlineService.deleteAlertBySymbolAndPrice(this.symbol, price);
    // }
  }
}
