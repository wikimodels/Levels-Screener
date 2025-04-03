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
  private vwapSeries: ISeriesApi<'Line'> | null = null;
  private activeVWAPs: Map<
    UTCTimestamp,
    { time: UTCTimestamp; value: number }[]
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

    // Create single VWAP series
    this.vwapSeries = this.chart.addLineSeries({
      color: '#FF00FF',
      lineWidth: 2,
      crosshairMarkerVisible: true,
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
    console.log('[VWAP] Total candles:', this.candleData.length);

    // Validate data exists and is valid
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
    const vwapData = [];
    console.log('[VWAP] First candle:', this.candleData[startIndex]);

    for (let i = startIndex; i < this.candleData.length; i++) {
      const candle = this.candleData[i];
      const typicalPrice = (candle.high + candle.low + candle.close) / 3;
      let volume = 0;

      // First try quoteVolume (price * quantity)
      if (
        typeof candle.quoteVolume === 'number' &&
        !isNaN(candle.quoteVolume)
      ) {
        volume = candle.quoteVolume;
      }
      // Fallback to baseVolume * typicalPrice if quoteVolume is invalid
      else if (
        typeof candle.baseVolume === 'number' &&
        !isNaN(candle.baseVolume)
      ) {
        volume = candle.baseVolume * typicalPrice;
      }
      // Final fallback to typicalPrice if both volumes are invalid
      else {
        volume = typicalPrice;
        console.warn(`[VWAP] Using fallback volume for candle ${i}`);
      }

      console.log(`[VWAP] Candle ${i}:
        Time: ${new Date(candle.time * 1000).toISOString()}
        TP: ${typicalPrice.toFixed(4)}
        Vol: ${volume.toFixed(4)}
        O: ${candle.open.toFixed(4)}
        H: ${candle.high.toFixed(4)}
        L: ${candle.low.toFixed(4)}
        C: ${candle.close.toFixed(4)}`);

      if (volume > 0) {
        cumulativePV += typicalPrice * volume;
        cumulativeVolume += volume;
        const currentVWAP = cumulativePV / cumulativeVolume;

        console.log(`[VWAP] Cumulative PV: ${cumulativePV.toFixed(4)}
          Cumulative Vol: ${cumulativeVolume.toFixed(4)}
          Current VWAP: ${currentVWAP.toFixed(4)}`);

        vwapData.push({
          time: candle.time,
          value: currentVWAP,
        });
      }
    }

    console.log('[VWAP] Calculation complete. Points:', vwapData.length);
    console.log('[VWAP] Sample points:', vwapData.slice(0, 3));
    return vwapData;
  }

  private setupClickHandler(): void {
    this.chart.subscribeClick((param) => {
      if (!param.time) return;

      const clickedTime = param.time as UTCTimestamp;
      const clickedCandle = this.candleData.find((c) => c.time === clickedTime);

      if (!clickedCandle) return;

      // Toggle highlight
      if (this.highlightedCandleTime === clickedTime) {
        this.resetHighlight();
        return;
      }
      this.highlightCandle(clickedTime);

      // Handle VWAP
      const clickedIndex = this.candleData.findIndex(
        (c) => c.time === clickedTime
      );
      if (clickedIndex >= 0 && this.vwapSeries) {
        // Toggle VWAP for clicked candle
        if (this.activeVWAPs.has(clickedTime)) {
          // Remove VWAP if already exists
          this.activeVWAPs.delete(clickedTime);
          console.log('Removed VWAP for candle:', clickedTime);
        } else {
          // Add new VWAP
          const vwapData = this.calculateVWAP(clickedIndex);
          if (vwapData.length > 1) {
            // Need at least 2 points
            this.activeVWAPs.set(clickedTime, vwapData);
            console.log('Added VWAP for candle:', clickedTime);
          }
        }

        // Update chart with all active VWAPs
        this.updateVWAPSeries();
      }
    });
  }

  private updateVWAPSeries(): void {
    if (!this.vwapSeries) return;

    // Combine, sort and deduplicate all VWAP points
    const allVWAPs = Array.from(this.activeVWAPs.values())
      .flat()
      .sort((a, b) => a.time - b.time)
      .filter((point, index, array) => {
        return (
          index === 0 ||
          (point.time > array[index - 1].time &&
            point.time !== array[index - 1].time)
        );
      });

    try {
      if (allVWAPs.length > 1) {
        this.vwapSeries.setData(allVWAPs);
      } else {
        this.vwapSeries.setData([]);
      }
    } catch (error) {
      console.error('Error updating VWAP:', error);
      this.vwapSeries.setData([]);
    }
  }

  private highlightCandle(time: UTCTimestamp): void {
    this.highlightedCandleTime = time;

    // Create new array with highlighted candle
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
  }

  private resetHighlight(): void {
    this.highlightedCandleTime = null;
    this.candlestickSeries.setData(this.candleData);

    // Clear all VWAPs
    if (this.vwapSeries) {
      this.vwapSeries.setData([]);
    }
    this.activeVWAPs.clear();
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
