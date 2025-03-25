import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';

import { KLINE_URLS } from 'src/consts/url-consts';
import { SnackbarService } from '../snackbar.service';
import { SnackbarType } from 'models/shared/snackbar-type';
import { KlineData } from 'models/kline/kline-data';

@Injectable({
  providedIn: 'root',
})
export class KlineDataService {
  private klineChartOptionsSubject = new BehaviorSubject<any>(null);
  public klineChartOptions$ = this.klineChartOptionsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private snackBarService: SnackbarService
  ) {}

  fetchKlineData(
    symbol: string,
    timeframe: string,
    limit: number
  ): Observable<any> {
    const params = new HttpParams()
      .set('symbol', symbol)
      .set('timeframe', timeframe)
      .set('limit', limit.toString());

    return this.http
      .get<{ timeframe: string; symbol: string; data: KlineData[] }>(
        KLINE_URLS.proxyKlineUrl,
        { params }
      )
      .pipe(
        tap((response) => {
          console.log('KlineData', response);
        }),
        map((response) => response.data),
        map((data) => this.generateKlineChartOptions(data)),
        tap((chartOptions) => {
          this.klineChartOptionsSubject.next(chartOptions);
          this.snackBarService.showSnackBar(
            'Kline chart options generated successfully',
            '',
            3000,
            SnackbarType.Info
          );
        }),
        catchError((error) => {
          console.error('Error fetching kline data:', error);
          this.snackBarService.showSnackBar(
            'Error fetching kline data',
            '',
            4000,
            SnackbarType.Error
          );
          return throwError(() => error);
        })
      );
  }

  clearKlineData(): void {
    this.klineChartOptionsSubject.next(null);
  }

  private calculateMA(data: number[], dayCount: number): (number | string)[] {
    const result: (number | string)[] = [];
    for (let i = 0; i < data.length; i++) {
      if (i < dayCount - 1) {
        result.push('-');
      } else {
        const sum = data
          .slice(i - dayCount + 1, i + 1)
          .reduce((acc, curr) => acc + curr, 0);
        result.push(sum / dayCount);
      }
    }
    return result;
  }

  private generateKlineChartOptions(klineData: KlineData[]): any {
    const candlestickData = klineData.map((item) => [
      item.openTime,
      item.openPrice,
      item.closePrice,
      item.lowPrice,
      item.highPrice,
    ]);

    // Add future dummy data points
    const lastTime = klineData[klineData.length - 1]?.openTime || Date.now();
    const interval = 15 * 60 * 1000; // 15 minutes in ms
    const futurePointsCount = 28; // ~7 hours forward
    for (let i = 1; i <= futurePointsCount; i++) {
      const futureTime = lastTime + i * interval;
      candlestickData.push([futureTime, NaN, NaN, NaN, NaN]);
    }

    const closePrices = klineData.map((item) => item.closePrice);

    const maFast = this.calculateMA(closePrices, 50);
    const maMedium = this.calculateMA(closePrices, 100);
    const maSlow = this.calculateMA(closePrices, 150);

    return {
      title: {
        text: `${klineData[0].symbol}`,
        left: 'center',
        top: '1%', // move the title up a bit
      },
      legend: {
        data: ['Candlestick', 'MA50', 'MA100', 'MA150'],
        top: '6%', // move legend down below the title
        left: 'center',
      },
      dataZoom: [
        {
          type: 'inside',
          start: 50,
          end: 100,
        },
        {
          show: true,
          type: 'slider',
          top: '90%',
          start: 50,
          end: 100,
        },
      ],
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
        formatter: (params: any[]) => {
          const candle = params.find((p) => p.seriesType === 'candlestick');
          if (candle) {
            const [time, open, close, low, high] = candle.data;
            const date = new Date(time).toLocaleString();
            return `
              <b>${date}</b><br/>
              Open: ${open}<br/>
              Close: ${close}<br/>
              Low: ${low}<br/>
              High: ${high}
            `;
          }
          return '';
        },
      },

      grid: { left: '10%', right: '10%', bottom: '15%' },
      xAxis: {
        type: 'time',
        boundaryGap: false,
        axisLine: { onZero: false },
        splitLine: { show: false },
        min: 'dataMin',
        max: 'dataMax',
      },
      yAxis: { scale: true, splitArea: { show: true } },
      series: [
        {
          name: 'Candlestick',
          type: 'candlestick',
          data: candlestickData,
          itemStyle: {
            color: '#ec0000',
            color0: '#00da3c',
            borderColor: '#8A0000',
            borderColor0: '#008F28',
          },
        },
        {
          name: 'MA50',
          type: 'line',
          data: klineData.map((item, index) => [item.openTime, maFast[index]]),
          smooth: true,
          lineStyle: { opacity: 0.7, width: 1.5 },
          showSymbol: false,
        },
        {
          name: 'MA100',
          type: 'line',
          data: klineData.map((item, index) => [
            item.openTime,
            maMedium[index],
          ]),
          smooth: true,
          lineStyle: { opacity: 0.7, width: 1.5 },
          showSymbol: false,
        },
        {
          name: 'MA150',
          type: 'line',
          data: klineData.map((item, index) => [item.openTime, maSlow[index]]),
          smooth: true,
          lineStyle: { opacity: 0.7, width: 1.5 },
          showSymbol: false,
        },
      ],
    };
  }
}
