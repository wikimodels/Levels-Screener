import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
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
import { createVwapAlert } from 'src/functions/create-vwap-alert';
import { Coin } from 'models/coin/coin';
import { VwapAlert } from 'models/vwap/vwap-alert';
import { _ChartOptions } from 'models/chart/chart-options';
import { CoinsGenericService } from '../coins/coins-generic.service';
import { AlertsCollection } from 'models/alerts/alerts-collections';
import { createHttpParams } from 'src/functions/create-params';
import { Alert } from 'models/alerts/alert';
import { createLineAlert } from 'src/functions/create-line-alert';
import { transformToCandlestickData } from 'src/functions/transform-to-candlestick-data';

@Injectable({
  providedIn: 'root',
})
export class LineTwChartService {
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }),
  };

  constructor(
    private http: HttpClient,
    private snackBarService: SnackbarService,
    private coinsService: CoinsGenericService
  ) {}

  /**
   * Fetches Kline data from the backend API.
   */
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
        const vwapLines = this.calculateVwapLinesForAlerts(vwapAlerts, kline);
        const lines = this.calculateLinesForAlerts(alerts, kline);

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

  calculateLinesForAlerts(
    alerts: Alert[],
    klineData: KlineData[]
  ): { time: UTCTimestamp; value: number }[][] {
    if (!klineData || klineData.length === 0) {
      console.error('[Line] No Kline data available for line calculation');
      return [];
    }

    // Ensure Kline data is sorted by time
    klineData.sort((a, b) => a.openTime - b.openTime);

    // Extract the first and last timestamps from Kline data
    const startTime = Math.floor(klineData[0].openTime / 1000) + 3 * 60 * 60; // Convert to seconds and add 3 hours
    const endTime =
      Math.floor(klineData[klineData.length - 1].openTime / 1000) + 3 * 60 * 60;

    const lines: { time: UTCTimestamp; value: number }[][] = [];

    alerts.forEach((alert) => {
      if (typeof alert.price !== 'number' || isNaN(alert.price)) {
        console.warn(`[Line] Invalid price for alert ID: ${alert.id}`);
        return;
      }

      // Create a horizontal line with two points: start and end time
      const lineData: { time: UTCTimestamp; value: number }[] = [
        { time: startTime as UTCTimestamp, value: alert.price },
        { time: endTime as UTCTimestamp, value: alert.price },
      ];

      lines.push(lineData);
    });

    return lines;
  }

  calculateVwapLinesForAlerts(
    alerts: VwapAlert[],
    klineData: KlineData[]
  ): { time: UTCTimestamp; value: number }[][] {
    if (!klineData || klineData.length === 0) {
      console.error('[VWAP] No Kline data available for VWAP calculation');
      return [];
    }

    // Ensure Kline data is sorted by time
    klineData.sort((a, b) => a.openTime - b.openTime);

    const vwapLines: { time: UTCTimestamp; value: number }[][] = [];

    alerts.forEach((alert) => {
      if (typeof alert.anchorTime !== 'number' || isNaN(alert.anchorTime)) {
        console.warn(`[VWAP] Invalid anchorTime for alert ID: ${alert.id}`);
        return;
      }

      // Find the starting index in Kline data
      const startIndex = klineData.findIndex(
        (kline) => Number(kline.openTime) === Number(alert.anchorTime)
      );

      if (startIndex === -1) {
        console.warn(
          `[VWAP] No matching Kline data for anchorTime: ${alert.anchorTime}`
        );
        return;
      }

      let cumulativePV = 0;
      let cumulativeVolume = 0;

      const vwapData: { time: UTCTimestamp; value: number }[] = [];

      klineData.slice(startIndex).forEach((candle) => {
        const typicalPrice =
          (candle.highPrice + candle.lowPrice + candle.closePrice) / 3;

        // Determine volume (quoteVolume or baseVolume)
        let volume = 0;
        if (
          typeof candle.quoteVolume === 'number' &&
          !isNaN(candle.quoteVolume) &&
          candle.quoteVolume > 0
        ) {
          volume = candle.quoteVolume;
        } else if (
          typeof candle.baseVolume === 'number' &&
          !isNaN(candle.baseVolume) &&
          candle.baseVolume > 0
        ) {
          volume = candle.baseVolume * typicalPrice;
        } else {
          console.warn(
            `[VWAP] No valid volume for candle at time: ${candle.openTime}`
          );
          return; // Skip this candle
        }

        if (volume > 0) {
          cumulativePV += typicalPrice * volume;
          cumulativeVolume += volume;
        }

        // Calculate VWAP value
        const vwapValue =
          cumulativeVolume > 0
            ? parseFloat((cumulativePV / cumulativeVolume).toFixed(8)) // Round to 8 decimal places
            : 0;

        // Push VWAP point with correct time format
        const adjustedTime = Math.floor(candle.openTime / 1000) + 3 * 60 * 60;
        vwapData.push({
          time: adjustedTime as UTCTimestamp, // Convert to seconds
          value: vwapValue,
        });
      });

      if (vwapData.length > 0) {
        vwapLines.push(vwapData);
      }
    });

    return vwapLines;
  }
  /**
   * Saves an anchor point for VWAP calculation.
   */
  addAlertBySymbolAndPrice(symbol: string, price: number): Observable<any> {
    const collectionName = AlertsCollection.WorkingAlerts;
    const coins = this.coinsService.getCoins();
    const coin = coins.find((coin: Coin) => coin.symbol === symbol);

    if (!coin) {
      console.error(`Coin not found for symbol: ${symbol}`);
      return throwError(
        () => new Error(`Coin not found for symbol: ${symbol}`)
      );
    }
    const alert = createLineAlert(symbol, price, coin);

    // HTTP request to add a VwapAlert with query parameters
    const params = createHttpParams({ collectionName });
    const options = { ...this.httpOptions, params };

    return this.http.post(ALERTS_URLS.alertsAddOneUrl, { alert }, options).pipe(
      tap(() => {
        this.snackBarService.showSnackBar(
          'Alert saved successfully!',
          '',
          2000,
          SnackbarType.Info
        );
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error saving anchor point:', error);
        return throwError(() => new Error('Failed to save alert'));
      })
    );
  }

  /**
   * Deletes an anchor point for VWAP calculation.
   */
  deleteAlertBySymbolAndPrice(symbol: string, price: number): Observable<any> {
    const collectionName = AlertsCollection.WorkingAlerts;
    // HTTP request to add a VwapAlert with query parameters
    const params = createHttpParams({ symbol, collectionName, price });
    const options = { ...this.httpOptions, params };
    return this.http
      .delete(ALERTS_URLS.alertsDeleteBySymbolAndPriceUrl, options)
      .pipe(
        tap(() => {
          this.snackBarService.showSnackBar(
            'Alert removed successfully!',
            '',
            2000,
            SnackbarType.Info
          );
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Error deleting alert:', error);
          return throwError(() => new Error('Failed to delete alert'));
        })
      );
  }

  /**
   * Handles errors and displays a snackbar notification.
   */
  private handleError(error: any, message: string): Observable<never> {
    console.error(`❌ ${message}`, error);
    this.snackBarService.showSnackBar(message, '', 4000, SnackbarType.Error);
    return throwError(() => new Error(message));
  }
}
