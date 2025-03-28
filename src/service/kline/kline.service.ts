import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, tap, catchError, forkJoin } from 'rxjs';

import { ANCHORED_VWAP_URLS, KLINE_URLS } from 'src/consts/url-consts';
import { SnackbarService } from '../snackbar.service';
import { SnackbarType } from 'models/shared/snackbar-type';
import { KlineData } from 'models/kline/kline-data';
import { AnchorPoint } from 'models/vwap/anchor-point';

@Injectable({ providedIn: 'root' })
export class KlineDataService {
  private klineChartOptionsSubject = new BehaviorSubject<any>(null);
  public klineChartOptions$ = this.klineChartOptionsSubject.asObservable();

  private klineDataMap = new Map<string, KlineData[]>();
  private anchorPointsMap = new Map<string, AnchorPoint[]>();

  constructor(
    private http: HttpClient,
    private snackBarService: SnackbarService
  ) {}

  /**
   * Fetches Kline data and anchored VWAP points from API.
   * Stores data and updates chart options.
   */
  fetchKlineAndAnchors(
    symbol: string,
    timeframe: string,
    limit: number
  ): Observable<any> {
    console.log(
      `🔄 [fetchKlineAndAnchors] Fetching data for: ${symbol}, TF: ${timeframe}, Limit: ${limit}`
    );

    const klineParams = new HttpParams()
      .set('symbol', symbol)
      .set('timeframe', timeframe)
      .set('limit', limit.toString());

    console.log(
      `🌍 Kline API Request: ${KLINE_URLS.proxyKlineUrl} | Params:`,
      klineParams.toString()
    );

    const klineRequest = this.http
      .get<{ data: KlineData[] }>(KLINE_URLS.proxyKlineUrl, {
        params: klineParams,
      })
      .pipe(
        tap((response) => console.log('✅ Kline API Response:', response)),
        map((response) => response.data),
        catchError((error) =>
          this.handleError(error, 'Error fetching Kline data')
        )
      );

    console.log(
      `🌍 Anchor Points API Request: ${ANCHORED_VWAP_URLS.anchoredPointsBySymbolUrl}?symbol=${symbol}`
    );

    const anchorRequest = this.http
      .get<AnchorPoint[]>(
        `${ANCHORED_VWAP_URLS.anchoredPointsBySymbolUrl}?symbol=${symbol}`
      )
      .pipe(
        tap((response) =>
          console.log('✅ Anchor Points API Response:', response)
        ),
        catchError((error) =>
          this.handleError(error, 'Error fetching anchor points')
        )
      );

    return forkJoin([klineRequest, anchorRequest]).pipe(
      tap(([klineData, anchorPoints]) => {
        console.log('🛠 Storing Kline Data:', klineData);
        console.log('🛠 Storing Anchor Points:', anchorPoints);
      }),
      map(([klineData, anchorPoints]) => {
        if (!klineData || !anchorPoints) {
          console.warn('⚠️ Missing data in API response:', {
            klineData,
            anchorPoints,
          });
          return {};
        }

        this.klineDataMap.set(symbol, klineData);
        this.anchorPointsMap.set(symbol, anchorPoints);

        console.log('📊 Generating chart options...');
        const options = this.generateKlineChartOptions(
          symbol,
          klineData,
          anchorPoints
        );
        console.log('📈 Generated Chart Options:', options);
        return options;
      }),
      tap((options) => this.klineChartOptionsSubject.next(options))
    );
  }

  /**
   * Retrieves stored Kline data for a given symbol.
   */
  getKlineData(symbol: string): KlineData[] | undefined {
    console.log(`📦 Retrieving stored Kline data for: ${symbol}`);
    return this.klineDataMap.get(symbol);
  }

  /**
   * Retrieves stored anchor points for a given symbol.
   */
  getAnchorPoints(symbol: string): AnchorPoint[] | undefined {
    console.log(`📦 Retrieving stored anchor points for: ${symbol}`);
    return this.anchorPointsMap.get(symbol);
  }

  /**
   * Generates chart options for Kline data and VWAP visualization.
   */
  private generateKlineChartOptions(
    symbol: string,
    klineData: KlineData[],
    anchorPoints: AnchorPoint[]
  ): any {
    if (!Array.isArray(klineData) || !Array.isArray(anchorPoints)) {
      console.error('❌ Invalid data for chart generation', {
        klineData,
        anchorPoints,
      });
      return {};
    }

    console.log(`📊 Processing Kline and VWAP data for ${symbol}`);

    // Add 7-8 hours of dummy data (just time intervals without price data)
    // Get the last openTime from klineData
    const lastKlineTime = klineData.length
      ? klineData[klineData.length - 1].openTime
      : Date.now();

    // Add 8 hours of dummy data (15-minute intervals) from the last kline's openTime
    const dummyData: [number, number, number, number, number][] = [];
    const startTime = lastKlineTime + 15 * 60 * 1000; // Add 15 minutes to the last Kline's openTime
    for (let i = 0; i < (8 * 60) / 15; i++) {
      // 15-minute intervals (8 hours)
      const timestamp = startTime + i * 15 * 60 * 1000; // 15-minute interval
      dummyData.push([timestamp, NaN, NaN, NaN, NaN]); // Dummy price data (0s)
    }

    // Combine the dummy data with the actual candlestick data
    const candlestickData = [
      ...klineData.map((k) => [
        k.openTime,
        k.openPrice,
        k.closePrice,
        k.lowPrice,
        k.highPrice,
      ]),
      ...dummyData, // Add the dummy data
    ];

    const vwapSeries = anchorPoints.map((anchorPoint) => {
      const anchorTime = anchorPoint.anchorTime;
      const relevantKlines = klineData.filter((k) => k.openTime >= anchorTime);

      let cumulativeVolume = 0;
      let cumulativeVWAP = 0;
      const vwapData: [number, number][] = [];

      relevantKlines.forEach((k) => {
        const typicalPrice = (k.highPrice + k.lowPrice + k.closePrice) / 3;
        cumulativeVolume += k.baseVolume;
        cumulativeVWAP += typicalPrice * k.baseVolume;
        vwapData.push([k.openTime, cumulativeVWAP / cumulativeVolume]);
      });

      return {
        name: `VWAP (${new Date(anchorTime).toLocaleTimeString()})`,
        type: 'line',
        data: vwapData,
        smooth: true,
        lineStyle: { color: 'orange', width: 2 },
        showSymbol: false,
      };
    });

    return {
      title: { text: `${symbol}`, left: 'center', top: '1%' },
      legend: {
        data: ['Candlestick', ...vwapSeries.map((s) => s.name)],
        top: '6%',
        left: 'center',
      },
      xAxis: {
        type: 'time',
        boundaryGap: false,
        min: 'dataMin',
        max: 'dataMax',
      },
      yAxis: { scale: true, splitArea: { show: true } },
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
      series: [
        {
          name: 'Candlestick',
          type: 'candlestick',
          itemStyle: {
            color: '#00da3c', //green
            color0: '#ec0000', //red
            borderColor: '#00da3c',
            borderColor0: '#ec0000',
          },
          data: candlestickData,
        },
        ...vwapSeries,
      ],
    };
  }

  /**
   * Handles errors and displays a snackbar notification.
   */
  private handleError(error: any, message: string) {
    console.error(`❌ ${message}`, error);
    this.snackBarService.showSnackBar(message, '', 4000, SnackbarType.Error);
    return throwError(() => error);
  }
}
