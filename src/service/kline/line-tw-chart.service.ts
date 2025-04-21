import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ALERTS_URLS } from 'src/consts/url-consts';
import { SnackbarService } from '../snackbar.service';
import { SnackbarType } from 'src/app/models/shared/snackbar-type';
import { Coin } from 'src/app/models/coin/coin';
import { _ChartOptions } from 'src/app/models/chart/chart-options';
import { CoinsGenericService } from '../coins/coins-generic.service';
import { AlertsCollection } from 'src/app/models/alerts/alerts-collections';
import { createHttpParams } from 'src/functions/create-params';
import { createLineAlert } from 'src/functions/create-line-alert';
import { BaseChartService } from './base-chart.service';

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

  addAlertBySymbolAndPrice(symbol: string, price: number): void {
    const collectionName = AlertsCollection.WorkingAlerts;
    const coins = this.coinsService.getCoins();
    const coin = coins.find((coin: Coin) => coin.symbol === symbol);

    if (!coin) {
      console.error(`Coin not found for symbol: ${symbol}`);
      throwError(() => new Error(`Coin not found for symbol: ${symbol}`));
    }
    const alert = createLineAlert(symbol, price, coin);

    // HTTP request to add a VwapAlert with query parameters
    const params = createHttpParams({ collectionName });
    const options = { ...this.httpOptions, params };

    this.http
      .post(ALERTS_URLS.alertsAddOneUrl, { alert }, options)
      .pipe(
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
      )
      .subscribe({
        next: (data) => {
          // Handle successful response (if needed)
          console.log('Alert added successfully:', data);
          this.snackBarService.showSnackBar(
            'Alert added successfully!',
            '',
            2000,
            SnackbarType.Info
          );
        },
        error: (err) => {
          // Handle error explicitly
          console.error('Error in subscription:', err);
          this.snackBarService.showSnackBar(err, '', 8000, SnackbarType.Error);
        },
        complete: () => {
          // Handle completion (optional)
          console.log('DELETE request completed.');
        },
      });
  }

  deleteAlertBySymbolAndPrice(symbol: string, price: number): void {
    const collectionName = AlertsCollection.WorkingAlerts;
    // HTTP request to add a VwapAlert with query parameters
    const params = createHttpParams({ symbol, collectionName, price });
    const options = { ...this.httpOptions, params };
    this.http
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
      )
      .subscribe({
        next: (data) => {
          // Handle successful response (if needed)
          console.log('Alert deleted successfully:', data);
          this.snackBarService.showSnackBar(
            'Alert removed successfully!',
            '',
            2000,
            SnackbarType.Info
          );
        },
        error: (err) => {
          // Handle error explicitly
          console.error('Error in subscription:', err);
          this.snackBarService.showSnackBar(err, '', 8000, SnackbarType.Error);
        },
        complete: () => {
          // Handle completion (optional)
          console.log('DELETE request completed.');
        },
      });
  }
}
