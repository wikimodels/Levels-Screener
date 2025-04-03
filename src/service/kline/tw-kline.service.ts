import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { interval, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { KlineData } from '../../models/kline/kline-data';
import { CandlestickData, UTCTimestamp } from 'lightweight-charts';
import { KLINE_URLS } from 'src/consts/url-consts';
import { SnackbarService } from '../snackbar.service';
import { SnackbarType } from 'models/shared/snackbar-type';

@Injectable({
  providedIn: 'root',
})
export class TWKlineService {
  // Replace with actual API endpoint

  constructor(
    private http: HttpClient,
    private snackBarService: SnackbarService
  ) {}

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
    return this.http
      .get<{ data: KlineData[] }>(KLINE_URLS.proxyKlineUrl, {
        params: klineParams,
      })
      .pipe(
        map((data) => data.data),
        map((data: KlineData[]) => this.transformToCandlestickData(data)),
        catchError((error) =>
          this.handleError(error, 'Error fetching Kline data')
        )
      );
  }

  private transformToCandlestickData(
    klineData: KlineData[]
  ): CandlestickData[] {
    return klineData.map((kline) => ({
      time: (Math.floor(kline.openTime / 1000) + 3 * 60 * 60) as UTCTimestamp, // Add 3 hours (10800 seconds)
      open: kline.openPrice,
      high: kline.highPrice,
      low: kline.lowPrice,
      close: kline.closePrice,
    }));
  }

  private handleError(error: any, message: string) {
    console.error(`❌ ${message}`, error);
    this.snackBarService.showSnackBar(message, '', 4000, SnackbarType.Error);
    return throwError(() => error);
  }
}
