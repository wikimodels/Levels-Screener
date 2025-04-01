import { Component, Input, OnDestroy, NgZone, OnInit } from '@angular/core';
import { EChartsOption } from 'echarts';
import { EChartsType } from 'echarts/core';
import { KlineData } from 'models/kline/kline-data';
import { KlineDataService } from 'src/service/kline/kline.service';
import { VwapChartService } from 'src/service/vwap-alerts/vwap-chart.service';
import { Subscription } from 'rxjs';
import { ChartRefreshService } from 'src/service/kline/chart-refresh.service';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css'],
})
export class ChartComponent implements OnInit, OnDestroy {
  @Input() chartOptions: EChartsOption = {};
  @Input() symbol = '';
  @Input() timeframe = 'm15';
  @Input() limit = 0;
  private chart: EChartsType | null = null;
  private vwapLines: { [key: number]: any } = {}; // Store VWAP lines by openTime
  @Input() klineData: KlineData[] | undefined;

  private subscriptions: Subscription[] = []; // Array to hold subscriptions

  constructor(
    private vwapService: VwapChartService,
    private klineDataService: KlineDataService,
    private chartRefreshService: ChartRefreshService
  ) {}

  ngOnInit(): void {
    const subscription = this.chartRefreshService.refreshChart$.subscribe(
      () => {
        this.redrawChart();
      }
    );
    this.subscriptions.push(subscription);
  }

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
      .saveAnchorPoint(this.symbol, openTime)
      .subscribe((result) => {
        this.addVwap(openTime);
        // result.deletedCount === 0 ? this.addVwap(openTime) : this.//redrawChart();
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

  public fetchAndUpdateChart(): void {
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

    const vwapData = this.vwapService.calculateVwap(
      this.klineData.slice(startIndex)
    );
    if (!vwapData.length) {
      console.error('VWAP data is empty!');
      return;
    }

    const vwapSeries = this.vwapService.createVwapSeries(openTime, vwapData);

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

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions to prevent memory leaks
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
