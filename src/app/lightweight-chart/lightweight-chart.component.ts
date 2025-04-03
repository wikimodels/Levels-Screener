import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  UTCTimestamp,
} from 'lightweight-charts';
import { TWKlineService } from '../../service/kline/tw-kline.service';

interface SafeCandleData {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
  baseVolume: number;
  quoteVolume: number;
}

@Component({
  selector: 'app-lightweight-chart',
  templateUrl: './lightweight-chart.component.html',
  styleUrls: ['./lightweight-chart.component.css'],
})
export class LightweightChartComponent implements OnInit {
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;
  private chart!: IChartApi;
  private candlestickSeries!: ISeriesApi<'Candlestick'>;
  private highlightedCandleTime: UTCTimestamp | null = null;
  private candleData: SafeCandleData[] = [];
  private vwapLines: Map<
    UTCTimestamp,
    {
      series: ISeriesApi<'Line'>;
      data: { time: UTCTimestamp; value: number }[];
    }
  > = new Map();

  constructor(private klineService: TWKlineService) {}

  ngOnInit(): void {
    window.scrollTo(0, 0);
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
        background: { color: '#222' },
        textColor: '#DDD',
      },
      grid: {
        vertLines: { color: '#444' },
        horzLines: { color: '#444' },
      },
      crosshair: {
        mode: 1, // Normal crosshair mode
        vertLine: {
          width: 1,
          color: 'rgba(255, 255, 255, 0.5)',
          style: 0,
          labelBackgroundColor: '#333',
        },
        horzLine: {
          width: 1,
          color: 'rgba(255, 255, 255, 0.5)',
          style: 0,
          labelBackgroundColor: '#333',
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
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    this.chart.timeScale().fitContent();
  }

  private loadChartData(): void {
    this.klineService
      .fetchKlineAndAnchors('BTCUSDT', 'm15', 400)
      .subscribe((data: CandlestickData[]) => {
        this.candleData = data as SafeCandleData[];
        this.candlestickSeries.setData(this.candleData);
      });
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

      const clickedTime = param.time as UTCTimestamp;
      const clickedIndex = this.candleData.findIndex(
        (c) => c.time === clickedTime
      );

      if (clickedIndex < 0) return;

      if (this.vwapLines.has(clickedTime)) {
        // Remove existing VWAP line
        const vwapLine = this.vwapLines.get(clickedTime);
        if (vwapLine) {
          this.chart.removeSeries(vwapLine.series);
          this.vwapLines.delete(clickedTime);
          console.log('Removed VWAP for candle:', clickedTime);
        }
      } else {
        // Add new VWAP line
        const vwapData = this.calculateVWAP(clickedIndex);
        if (vwapData.length > 1) {
          const color = this.getRandomVWAPColor();
          const series = this.chart.addLineSeries({
            color,
            lineWidth: 2,
            crosshairMarkerVisible: true,
          });
          series.setData(vwapData);
          this.vwapLines.set(clickedTime, { series, data: vwapData });
          console.log('Added VWAP for candle:', clickedTime);
        }
      }
    });
  }

  private highlightCandle(time: UTCTimestamp): void {
    this.highlightedCandleTime = time;

    const highlightedData = this.candleData.map((candle) => {
      if (candle.time === time) {
        return {
          ...candle,
          color: '#FFA500',
          wickColor: '#FFA500',
          borderColor: '#FFA500',
        };
      }
      return candle;
    });

    this.candlestickSeries.setData(highlightedData);

    // Reset highlight after a short delay
    setTimeout(() => {
      this.candlestickSeries.setData(this.candleData);
    }, 500);
  }

  private getRandomVWAPColor(): string {
    const colors = [
      '#FF0000',
      '#00FF00',
      '#0000FF',
      '#FFFF00',
      '#FF00FF',
      '#00FFFF',
      '#FFA500',
      '#800080',
      '#008000',
      '#000080',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}
