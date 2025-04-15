import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { VWAP_ALERTS_URLS } from 'src/consts/url-consts';
import { SnackbarService } from '../snackbar.service';
import { SnackbarType } from 'models/shared/snackbar-type';
import { createVwapAlert } from 'src/functions/create-vwap-alert';
import { Coin } from 'models/coin/coin';
import { _ChartOptions } from 'models/chart/chart-options';
import { CoinsGenericService } from '../coins/coins-generic.service';
import { AlertsCollection } from 'models/alerts/alerts-collections';
import { createHttpParams } from 'src/functions/create-params';
import { BaseChartService } from './base-chart.service';

@Injectable({
  providedIn: 'root',
})
export class VwapTwChartService {
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }),
  };

  constructor(
    private http: HttpClient,
    private snackBarService: SnackbarService,
    private coinsService: CoinsGenericService,
    private baseChartService: BaseChartService
  ) {}

  fetchChartData(symbol: string, timeframe: string, limit: number) {
    return this.baseChartService.fetchCombinedChartData(
      symbol,
      timeframe,
      limit
    );
  }

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
}
