import { Subscription } from 'rxjs';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { KlineDataService } from 'src/service/kline/kline.service';
import { ActivatedRoute } from '@angular/router';
import { EChartsOption } from 'echarts';
import { KlineData } from 'models/kline/kline-data';

@Component({
  selector: 'app-kline-chart',
  templateUrl: './kline-chart.component.html',
  styleUrls: ['./kline-chart.component.css'],
})
export class KlineChartComponent implements OnInit, OnDestroy {
  private subscription = new Subscription();
  symbol!: string;
  timeframe = 'm15';
  limit = 400;
  options: EChartsOption = {};
  klineData: KlineData[] | undefined;

  constructor(
    private klineDataService: KlineDataService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const params = this.route.snapshot.queryParams;
    this.symbol = params['symbol'];

    this.subscription.add(
      this.klineDataService
        .fetchKlineAndAnchors(this.symbol, this.timeframe, this.limit)
        .subscribe((options: EChartsOption) => {
          this.options = options;
          this.klineData = this.klineDataService.getKlineData(this.symbol);
        })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
