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
import { KLINE_URLS, VWAP_ALERTS_URLS } from 'src/consts/url-consts';
import { SnackbarService } from '../snackbar.service';
import { SnackbarType } from 'models/shared/snackbar-type';
import { createVwapAlert } from 'src/functions/create-vwap-alert';
import { Coin } from 'models/coin/coin';
import { VwapAlert } from 'models/vwap/vwap-alert';
import { _ChartOptions } from 'models/chart/chart-options';
import { CoinsGenericService } from '../coins/coins-generic.service';
import { AlertsCollection } from 'models/alerts/alerts-collections';
import { createHttpParams } from 'src/functions/create-params';

@Injectable({
  providedIn: 'root',
})
export class TWKlineService {
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

  /**
   * Calculates VWAP lines for a set of VwapAlerts based on their anchorTime.
   */

  fetchCombinedChartData(
    symbol: string,
    timeframe: string,
    limit: number
  ): Observable<{
    candlestick: CandlestickData[];
    vwapLines: { time: UTCTimestamp; value: number }[][];
    klineData: KlineData[];
  }> {
    return forkJoin({
      kline: this.fetchKlineData(symbol, timeframe, limit),
      vwapAlerts: this.fetchVwapAlertsData(symbol),
    }).pipe(
      map(({ kline, vwapAlerts }) => {
        // Transform Kline data into Candlestick format
        const candlestickData = this.transformToCandlestickData(kline);

        // Generate VWAP lines
        const vwapLines = this.calculateVwapLinesForAlerts(vwapAlerts, kline);

        // Return the combined data including klineData
        return {
          candlestick: candlestickData,
          vwapLines,
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
  saveAnchorPoint(symbol: string, openTime: number): Observable<any> {
    const collectionName = AlertsCollection.WorkingAlerts;
    const coins = this.coinsService.getCoins();
    const coin = coins.find((coin: Coin) => coin.symbol === symbol);

    if (!coin) {
      console.error(`Coin not found for symbol: ${symbol}`);
      return throwError(
        () => new Error(`Coin not found for symbol: ${symbol}`)
      );
    }
    const alert = createVwapAlert(symbol, openTime, coin);

    // HTTP request to add a VwapAlert with query parameters
    const params = createHttpParams({ collectionName });
    const options = { ...this.httpOptions, params };

    return this.http
      .post(VWAP_ALERTS_URLS.vwapAlertsAddOneUrl, { alert }, options)
      .pipe(
        tap(() => {
          this.snackBarService.showSnackBar(
            'Anchor point saved successfully!',
            '',
            2000,
            SnackbarType.Info
          );
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Error saving anchor point:', error);
          return throwError(() => new Error('Failed to save anchor point'));
        })
      );
  }

  /**
   * Deletes an anchor point for VWAP calculation.
   */
  deleteVwapBySymbolAndOpenTime(
    symbol: string,
    openTime: number
  ): Observable<any> {
    const collectionName = AlertsCollection.WorkingAlerts;
    // HTTP request to add a VwapAlert with query parameters
    const params = createHttpParams({ symbol, collectionName, openTime });
    const options = { ...this.httpOptions, params };
    return this.http
      .delete(VWAP_ALERTS_URLS.vwapAlertDeleteBySymbolAndOpenTimeUrl, options)
      .pipe(
        tap(() => {
          this.snackBarService.showSnackBar(
            'Anchor point removed successfully!',
            '',
            2000,
            SnackbarType.Info
          );
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Error deleting anchor point:', error);
          return throwError(() => new Error('Failed to delete anchor point'));
        })
      );
  }

  /**
   * Transforms raw Kline data into Candlestick format.
   */
  private transformToCandlestickData(
    klineData: KlineData[]
  ): CandlestickData[] {
    const klineDataCopy = [...klineData]; // Create a shallow copy to avoid side effects

    // Filter out invalid entries
    const filteredData = klineDataCopy.filter(
      (kline) =>
        typeof kline.openTime === 'number' &&
        kline.openTime > 0 &&
        typeof kline.openPrice === 'number' &&
        typeof kline.highPrice === 'number' &&
        typeof kline.lowPrice === 'number' &&
        typeof kline.closePrice === 'number'
    );

    if (filteredData.length === 0) {
      console.warn('No valid KlineData after filtering');
      return [];
    }

    // Transform into candlestick format
    const candlestickData = filteredData.map((kline) => ({
      time: (Math.floor(kline.openTime / 1000) + 3 * 60 * 60) as UTCTimestamp, // Adjust for UTC offset
      open: kline.openPrice,
      high: kline.highPrice,
      low: kline.lowPrice,
      close: kline.closePrice,
    }));

    return candlestickData;
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
