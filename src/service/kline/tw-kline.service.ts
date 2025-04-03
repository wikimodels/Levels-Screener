import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { KlineData } from '../../models/kline/kline-data';
import { CandlestickData, UTCTimestamp } from 'lightweight-charts';
import {
  ANCHORED_VWAP_URLS,
  KLINE_URLS,
  VWAP_ALERTS_URLS,
} from 'src/consts/url-consts';
import { SnackbarService } from '../snackbar.service';
import { SnackbarType } from 'models/shared/snackbar-type';
import { CoinsGenericService } from '../coins/coins-generic.service';
import { createVwapAlert } from 'src/functions/create-vwap-alert';
import { Coin } from 'models/coin/coin';
import { VwapAlert } from 'models/vwap/vwap-alert';
import { forkJoin } from 'rxjs';
import { _ChartOptions } from 'models/chart/chart-options';

@Injectable({
  providedIn: 'root',
})
export class TWKlineService {
  constructor(
    private http: HttpClient,
    private snackBarService: SnackbarService,
    private coinsService: CoinsGenericService
  ) {}

  fetchKlineData(
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
    return this.http
      .get<{ data: KlineData[] }>(KLINE_URLS.proxyKlineUrl, {
        params: klineParams,
      })
      .pipe(
        map((data) => data.data),
        tap((data) => console.log('Fetched KlineData', data.length)),
        catchError((error) =>
          this.handleError(error, 'Error fetching Kline data')
        )
      );
  }

  fetchVwapAlertsData(symbol: string): Observable<VwapAlert[]> {
    const klineParams = new HttpParams().set('symbol', symbol);

    return this.http
      .get<VwapAlert[]>(ANCHORED_VWAP_URLS.anchoredPointsBySymbolUrl, {
        params: klineParams,
      })
      .pipe(
        tap((data) => console.log('Fetched VWAP Alerts Data', data.length)),
        catchError((error) =>
          this.handleError(error, 'Error fetching VWAP alerts data')
        )
      );
  }

  fetchCombinedChartData(
    symbol: string,
    timeframe: string,
    limit: number
  ): Observable<_ChartOptions> {
    console.log('Fetching combined chart data with:', {
      symbol,
      timeframe,
      limit,
    });

    return forkJoin({
      kline: this.fetchKlineData(symbol, timeframe, limit),
      vwapAlerts: this.fetchVwapAlertsData(symbol),
    }).pipe(
      map(({ kline, vwapAlerts }) => {
        console.log('Raw Kline Data for Combined Chart:', kline);
        console.log('Raw VWAP Alerts Data:', vwapAlerts);

        if (!kline || kline.length === 0) {
          console.warn('No Kline data available');
          return { candlestick: [], vwapLines: [] };
        }

        const candlestickData = this.transformToCandlestickData(kline);
        console.log('Transformed Candlestick Data:', candlestickData);

        if (candlestickData.length === 0) {
          console.warn('No valid Candlestick data after transformation');
          return { candlestick: [], vwapLines: [] };
        }

        if (!vwapAlerts || vwapAlerts.length === 0) {
          console.warn('No VWAP alerts available');
          return { candlestick: candlestickData, vwapLines: [] };
        }

        // Generate VWAP lines
        const vwapLines = vwapAlerts
          .filter(
            (alert): alert is VwapAlert & { anchorTime: number } =>
              typeof alert.anchorTime === 'number'
          )
          .map((alert) => {
            console.log(
              `Processing VWAP Alert: anchorTime=${alert.anchorTime}`
            );

            // Normalize anchorTime if necessary
            const normalizedAnchorTime = Math.floor(alert.anchorTime * 1000); // Convert seconds to milliseconds

            // Find matching kline entry
            const startIndex = kline.findIndex(
              (k: KlineData) =>
                Math.abs(k.openTime - normalizedAnchorTime) < 1000 // Allow 1-second tolerance
            );

            if (startIndex === -1) {
              console.warn(
                `No matching Kline data for anchorTime: ${alert.anchorTime}`
              );
              return null; // Skip this alert
            }

            console.log(
              `Found matching Kline data for anchorTime: ${alert.anchorTime} at index ${startIndex}`
            );

            // Calculate VWAP using the adapted logic
            let cumulativePV = 0;
            let cumulativeVolume = 0;
            const slicedKline = kline.slice(startIndex);
            console.log('Sliced Kline Data:', slicedKline);

            return slicedKline.map((candle: KlineData) => {
              const typicalPrice =
                (candle.highPrice + candle.lowPrice + candle.closePrice) / 3;

              // Determine volume (quoteVolume or baseVolume)
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
                volume = typicalPrice; // Fallback to typical price if no volume is available
              }

              // Update cumulative totals
              if (volume > 0) {
                cumulativePV += typicalPrice * volume;
                cumulativeVolume += volume;
              }

              // Calculate VWAP value
              const vwapValue =
                cumulativeVolume > 0
                  ? parseFloat((cumulativePV / cumulativeVolume).toFixed(8)) // Round to 8 decimal places
                  : 0;

              console.log(
                `VWAP Calculation: time=${candle.openTime}, typicalPrice=${typicalPrice}, volume=${volume}, cumulativePV=${cumulativePV}, cumulativeVolume=${cumulativeVolume}, vwapValue=${vwapValue}`
              );

              return {
                time: candle.openTime as UTCTimestamp,
                value: vwapValue,
              };
            });
          })
          .filter((line) => line !== null && line.length > 0);

        console.log('Generated VWAP Lines:', vwapLines);

        return { candlestick: candlestickData, vwapLines };
      }),
      catchError((error) => {
        console.error('Error combining chart data:', error);
        return throwError(
          () => new Error('Failed to fetch combined chart data')
        );
      })
    );
  }

  saveAnchorPoint(symbol: string, openTime: number) {
    const coins = this.coinsService.getCoins();
    const coin = coins.find((coin: Coin) => coin.symbol === symbol);
    const alert = createVwapAlert(symbol, openTime, coin);
    return this.http.post(ANCHORED_VWAP_URLS.anchoredPointAddUrl, alert).pipe(
      tap((data) => {
        console.log(data);
      }),
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

  deleteAnchorPoint(symbol: string, openTime: number) {
    return this.http
      .post<any>(`${ANCHORED_VWAP_URLS.anchoredPointDeleteUrl}`, {
        symbol,
        openTime,
      })
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

  private handleError(error: any, message: string) {
    console.error(`❌ ${message}`, error);
    this.snackBarService.showSnackBar(message, '', 4000, SnackbarType.Error);
    return throwError(() => error);
  }

  private transformToCandlestickData(
    klineData: KlineData[]
  ): CandlestickData[] {
    const klineDataCopy = [...klineData]; // Create a shallow copy to avoid side effects
    console.log('Raw KlineData:', klineDataCopy);

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
    console.log('Filtered KlineData:', filteredData);

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
    console.log('Transformed CandlestickData:', candlestickData);

    return candlestickData;
  }
}
