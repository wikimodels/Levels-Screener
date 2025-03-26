import { Component, Input, OnDestroy } from '@angular/core';
import { EChartsOption } from 'echarts';
import { EChartsType } from 'echarts/core';
import { KlineData } from 'models/kline/kline-data';
import { KlineDataService } from 'src/service/kline/kline.service';
import { AnchoredVwapService } from 'src/service/vwap/anchor-vwap.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css'],
})
export class ChartComponent implements OnDestroy {
  @Input() chartOptions: EChartsOption = {};
  @Input() symbol = '';
  @Input() timeframe = 'm15';
  @Input() limit = 0;
  private chart: EChartsType | null = null;
  private vwapLines: { [key: number]: any } = {}; // Store VWAP lines by openTime
  @Input() klineData: KlineData[] | undefined;

  private subscriptions: Subscription[] = []; // Array to hold subscriptions

  constructor(
    private vwapService: AnchoredVwapService,
    private klineDataService: KlineDataService
  ) {}

  onChartInit(chartInstance: EChartsType): void {
    this.chart = chartInstance;
    console.log('Chart initialized:', this.chart);

    this.chart.on('click', (params: any) => {
      if (params?.data) {
        const openTime = params.data[0]; // Assuming first value is open time
        this.toggleVwapLine(openTime);
      }
    });
  }

  toggleVwapLine(openTime: number): void {
    const subscription = this.vwapService
      .deleteAnchorPoint(this.symbol, openTime)
      .subscribe((result) => {
        result.deletedCount === 0 ? this.addVwap(openTime) : this.redrawChart();
      });
    this.subscriptions.push(subscription); // Store subscription
  }

  redrawChart(): void {
    if (this.chart) {
      this.fetchAndUpdateChart();
    } else {
      console.error('Chart instance is not available!');
    }
  }

  fetchAndUpdateChart(): void {
    const subscription = this.klineDataService
      .fetchKlineAndAnchors(this.symbol, this.timeframe, this.limit)
      .subscribe((options: EChartsOption) => {
        this.chartOptions = options;
      });
    this.subscriptions.push(subscription); // Store subscription
  }

  addVwap(openTime: number): void {
    console.log(`Fetching VWAP for openTime: ${openTime}`);

    if (!this.klineData?.length) {
      console.error('Kline data is empty or not available!');
      return;
    }

    const startIndex = this.klineData.findIndex(
      (kline) => kline.openTime === openTime
    );

    if (startIndex === -1) {
      console.error('No kline data found for the given openTime:', openTime);
      return;
    }

    const vwapData = this.calculateVwap(this.klineData.slice(startIndex));

    if (!vwapData.length) {
      console.error('VWAP data is empty!');
      return;
    }

    const vwapSeries = this.createVwapSeries(openTime, vwapData);

    this.vwapLines[openTime] = vwapSeries;

    if (this.chart) {
      const currentOption = this.chart.getOption() as { series?: any[] };
      this.chart.setOption({
        series: [...(currentOption.series || []), vwapSeries], // Append VWAP line
      });
      const saveSubscription = this.vwapService
        .saveAnchorPoint(this.symbol, openTime)
        .subscribe(() => {
          console.log('VWAP series added to chart');
        });
      this.subscriptions.push(saveSubscription); // Store subscription
    } else {
      console.error('Chart is not initialized!');
    }
  }

  // Helper methods for calculating and creating VWAP series (same as before)
  calculateVwap(klines: KlineData[]): [number, number][] {
    let cumulativeVolume = 0;
    let cumulativeVWAP = 0;
    const vwapData: [number, number][] = [];

    klines.forEach((kline) => {
      const {
        openTime,
        openPrice,
        closePrice,
        lowPrice,
        highPrice,
        baseVolume,
      } = kline;
      const typicalPrice = (highPrice + lowPrice + closePrice) / 3; // Average price
      cumulativeVolume += baseVolume;
      cumulativeVWAP += typicalPrice * baseVolume;

      const vwap = cumulativeVWAP / cumulativeVolume;
      vwapData.push([openTime, vwap]);
    });

    return vwapData;
  }

  createVwapSeries(openTime: number, vwapData: [number, number][]): any {
    return {
      name: `VWAP-${openTime}`,
      type: 'line',
      data: vwapData,
      smooth: true,
      lineStyle: { color: 'orange', width: 2 },
      showSymbol: false,
    };
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions to prevent memory leaks
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
