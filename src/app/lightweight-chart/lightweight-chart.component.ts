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
  private isZoomed = false;

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
      height: 450,
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

  private setupClickHandler(): void {
    this.chart.subscribeClick((param) => {
      if (!param.time) return;

      const clickedTime = param.time as UTCTimestamp;
      const clickedCandle = this.candleData.find((c) => c.time === clickedTime);

      if (!clickedCandle) return;

      // Toggle zoom effect
      this.isZoomed = !this.isZoomed;

      // Log candle details with formatted time
      console.log('Clicked Candle Details:', {
        time: new Date(clickedCandle.time * 1000).toLocaleString(undefined, {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        open: clickedCandle.open.toFixed(4),
        high: clickedCandle.high.toFixed(4),
        low: clickedCandle.low.toFixed(4),
        close: clickedCandle.close.toFixed(4),
        bodySize: Math.abs(clickedCandle.close - clickedCandle.open).toFixed(4),
        direction: clickedCandle.close > clickedCandle.open ? 'UP' : 'DOWN',
      });

      // Toggle highlight if same candle clicked
      if (this.highlightedCandleTime === clickedTime) {
        this.resetHighlight();
        return;
      }

      // Highlight new candle with zoom effect
      this.highlightCandle(clickedTime);
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
          borderVisible: this.isZoomed,
          borderWidth: this.isZoomed ? 2 : 0,
        };
      }
      return candle;
    });

    this.candlestickSeries.setData(highlightedData);
  }

  private resetHighlight(): void {
    this.highlightedCandleTime = null;
    this.isZoomed = false;
    this.candlestickSeries.setData(this.candleData);
  }
}
