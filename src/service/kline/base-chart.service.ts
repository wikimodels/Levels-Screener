// chart-base.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError, forkJoin } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { KlineData } from '../../models/kline/kline-data';
import { CandlestickData, UTCTimestamp } from 'lightweight-charts';
import {
  ALERTS_URLS,
  KLINE_URLS,
  VWAP_ALERTS_URLS,
} from 'src/consts/url-consts';
import { SnackbarService } from '../snackbar.service';
import { SnackbarType } from 'models/shared/snackbar-type';
import { transformToCandlestickData } from 'src/functions/transform-to-candlestick-data';
import { Alert } from 'models/alerts/alert';
import { VwapAlert } from 'models/vwap/vwap-alert';
import { calculateLinesForAlerts } from 'src/functions/calculate-lines-for-alerts';
import { calculateVwapLinesForAlerts } from 'src/functions/calculate-vwap-lines-for-alerts';

@Injectable({
  providedIn: 'root',
})
export class BaseChartService {
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }),
  };

  constructor(
    private http: HttpClient,
    private snackBarService: SnackbarService
  ) {}

  fetchKlineData(
    symbol: string,
    timeframe: string,
    limit: number
  ): Observable<KlineData[]> {
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

    return this.http
      .get<{ data: KlineData[] }>(KLINE_URLS.proxyKlineUrl, {
        params: klineParams,
      })
      .pipe(
        map((response) => response.data),
        tap((data) => console.log('Fetched KlineData:', data)),
        catchError((error) =>
          this.handleError(error, 'Error fetching Kline data')
        )
      );
  }

  /**
   * Fetches VWAP alerts data from the backend API.
   */
  fetchVwapAlertsData(symbol: string): Observable<VwapAlert[]> {
    const params = new HttpParams()
      .set('symbol', symbol)
      .set('collectionName', 'working');

    return this.http
      .get<VwapAlert[]>(VWAP_ALERTS_URLS.vwapAlertsBySymbolUrl, {
        params,
      })
      .pipe(
        tap((data) => console.log('Fetched VWAP Alerts Data:', data)),
        catchError((error) =>
          this.handleError(error, 'Error fetching VWAP alerts data')
        )
      );
  }

  fetchLineAlertsData(symbol: string): Observable<Alert[]> {
    const params = new HttpParams()
      .set('symbol', symbol)
      .set('collectionName', 'working');

    return this.http
      .get<Alert[]>(ALERTS_URLS.alertsBySymbolUrl, {
        params,
      })
      .pipe(
        tap((data) => console.log('Fetched VWAP Alerts Data:', data)),
        catchError((error) =>
          this.handleError(error, 'Error fetching VWAP alerts data')
        )
      );
  }

  fetchCombinedChartData(
    symbol: string,
    timeframe: string,
    limit: number
  ): Observable<{
    candlestick: CandlestickData[];
    vwapLines: { time: UTCTimestamp; value: number }[][];
    lines: { time: UTCTimestamp; value: number }[][];
    klineData: KlineData[];
  }> {
    return forkJoin({
      kline: this.fetchKlineData(symbol, timeframe, limit),
      vwapAlerts: this.fetchVwapAlertsData(symbol),
      alerts: this.fetchLineAlertsData(symbol),
    }).pipe(
      map(({ kline, vwapAlerts, alerts }) => {
        // Transform Kline data into Candlestick format
        const candlestickData = transformToCandlestickData(kline);

        // Generate VWAP lines
        const vwapLines = calculateVwapLinesForAlerts(vwapAlerts, kline);
        const lines = calculateLinesForAlerts(alerts, kline);

        // Return the combined data including klineData
        return {
          candlestick: candlestickData,
          vwapLines,
          lines,
          klineData: kline, // Include raw Kline data
        };
      }),
      catchError((error) => {
        console.error('Error combining chart data:', error);
        return throwError(
          () => new Error('Failed to fetch combined chart data')
        );
      })
    );
  }

  handleError(error: any, message: string): Observable<never> {
    console.error(`❌ ${message}`, error);
    this.snackBarService.showSnackBar(message, '', 4000, SnackbarType.Error);
    return throwError(() => new Error(message));
  }
}
