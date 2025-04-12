import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { UTCTimestamp } from 'lightweight-charts';
import { VwapTwChartService } from 'src/service/kline/vwap-tw-chart.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseChartDrawingService } from 'src/service/kline/base-chart-drawing.service';
import { LINE_LIGHTWEIGHT_CHART } from 'src/consts/url-consts';

@Component({
  selector: 'app-vwap-lightweight-chart',
  templateUrl: './vwap-lightweight-chart.component.html',
  styleUrls: [
    './vwap-lightweight-chart.component.css',
    './../../styles-alerts.css',
  ],
})
export class VwapLightweightChartComponent implements OnInit, OnDestroy {
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;
  //isRotating = this.baseCharDrawingService.isRotating;
  symbol!: string;
  imageUrl!: string;
  category!: string;
  tvLink!: string;

  constructor(
    private route: ActivatedRoute,
    private vwapKlineService: VwapTwChartService,
    public baseCharDrawingService: BaseChartDrawingService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    window.scrollTo(0, 0);
    const params = this.route.snapshot.queryParams;
    this.symbol = params['symbol'];
    this.imageUrl = params['imageUrl'];
    this.category = params['category'];
    this.tvLink = params['tvLink'];

    await this.baseCharDrawingService.initChart(this.chartContainer);
    this.baseCharDrawingService.loadChartData(this.symbol);
    this.setupClickHandler();
    this.setupHoverHandler();
  }

  refreshChartData() {
    this.baseCharDrawingService.loadChartData(this.symbol); // Replace
    this.setupClickHandler();
  }

  private setupHoverHandler(): void {
    this.baseCharDrawingService.chart.subscribeCrosshairMove((param) => {
      if (!param.time) return;

      const hoveredTime = param.time as UTCTimestamp;
      const hoveredCandle = this.baseCharDrawingService.candleData.find(
        (c) => c.time === hoveredTime
      );

      if (hoveredCandle) {
        // Update crosshair labels with detailed time
        this.baseCharDrawingService.chart.applyOptions({
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
    if (
      !this.baseCharDrawingService.candleData ||
      this.baseCharDrawingService.candleData.length === 0
    ) {
      console.error('[VWAP] No candle data available');
      return [];
    }
    if (
      startIndex < 0 ||
      startIndex >= this.baseCharDrawingService.candleData.length
    ) {
      console.error('[VWAP] Invalid startIndex:', startIndex);
      return [];
    }

    let cumulativeVolume = 0;
    let cumulativePV = 0;
    const vwapData: { time: UTCTimestamp; value: number }[] = [];

    for (
      let i = startIndex;
      i < this.baseCharDrawingService.candleData.length;
      i++
    ) {
      const candle = this.baseCharDrawingService.candleData[i];
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

    return vwapData;
  }

  private setupClickHandler(): void {
    this.baseCharDrawingService.chart.subscribeClick((param) => {
      if (!param.time) return;

      const clickedTime = param.time as UTCTimestamp; // This is in milliseconds
      const clickedIndex = this.baseCharDrawingService.candleData.findIndex(
        (c) => c.time === clickedTime
      );
      if (clickedIndex < 0) return;

      // Convert clickedTime to Unix timestamp (in seconds)
      const unixTimestamp =
        this.baseCharDrawingService.klineData[clickedIndex].openTime;

      if (this.baseCharDrawingService.vwapLines.has(clickedTime)) {
        // Remove existing VWAP line and delete anchor
        const vwapLine = this.baseCharDrawingService.vwapLines.get(clickedTime);
        if (vwapLine) {
          this.baseCharDrawingService.chart.removeSeries(vwapLine.series);
          this.baseCharDrawingService.vwapLines.delete(clickedTime);

          // Call delete service with Unix timestamp
          this.vwapKlineService
            .deleteVwapBySymbolAndOpenTime(this.symbol, unixTimestamp)
            .subscribe({
              next: () => {
                console.log('Anchor deleted successfully');
                // Optional: Add notification
              },
              error: (err: any) => {
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
          const series = this.baseCharDrawingService.chart.addLineSeries({
            color,
            lineWidth: 2,
            crosshairMarkerVisible: true,
            priceLineVisible: false, // Disable price labels on the scale
            lastValueVisible: false, // Disable last value display
          });

          series.setData(vwapData);
          this.baseCharDrawingService.vwapLines.set(clickedTime, {
            series,
            data: vwapData,
          });

          // Call save service with Unix timestamp
          this.vwapKlineService
            .saveAnchorPoint(this.symbol, unixTimestamp)
            .subscribe({
              next: (response: any) => {
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

  goToLineChart() {
    const urlTree = this.router.createUrlTree([LINE_LIGHTWEIGHT_CHART], {
      queryParams: {
        symbol: this.symbol,
        category: this.category,
        imageUrl: this.imageUrl,
      },
    });
    const url = this.router.serializeUrl(urlTree);
    window.open(url, '_blank');
  }

  ngOnDestroy(): void {
    this.baseCharDrawingService.destroyChart();
  }
}
