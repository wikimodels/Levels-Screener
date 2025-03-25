import { Subscription } from 'rxjs';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { KlineDataService } from 'src/service/kline/kline.service';
import { ActivatedRoute } from '@angular/router';
import { TF } from 'models/shared/timeframes';
import { ECharts, EChartsOption } from 'echarts';

@Component({
  selector: 'app-kline-chart',
  templateUrl: './kline-chart.component.html',
  styleUrls: ['./kline-chart.component.css'],
})
export class KlineChartComponent implements OnInit, OnDestroy {
  subscription = new Subscription();
  symbol!: string;
  timeframe = 'm15';
  limit = 400;
  options: EChartsOption = {};
  constructor(
    private klineDataService: KlineDataService,
    private route: ActivatedRoute
  ) {}
  ngOnInit(): void {
    const params = this.route.snapshot.queryParams;
    this.symbol = params['symbol'];

    this.subscription.add(
      this.klineDataService
        .fetchKlineData(this.symbol, this.timeframe, this.limit)
        .subscribe((options) => (this.options = options))
    );
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
