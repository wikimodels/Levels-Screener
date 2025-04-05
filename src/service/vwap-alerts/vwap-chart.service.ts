import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { SnackbarService } from '../snackbar.service';
import { ANCHORED_VWAP_URLS, VWAP_ALERTS_URLS } from 'src/consts/url-consts';
import { SnackbarType } from 'models/shared/snackbar-type';
import { KlineData } from 'models/kline/kline-data';
import { Coin } from 'models/coin/coin';
import { CoinsGenericService } from '../coins/coins-generic.service';
import { VwapAlert } from 'models/vwap/vwap-alert';
import { formatToUTCString } from 'src/utils/fortmat-to-utc-str';
import { v4 as uuidv4 } from 'uuid';
import { VwapAlertsGenericService } from './vwap-alerts-generic.service';
import { AlertsCollection } from 'models/alerts/alerts-collections';
import { createVwapAlert } from 'src/functions/create-vwap-alert';

@Injectable({
  providedIn: 'root',
})
export class VwapChartService {
  constructor(
    private http: HttpClient,
    private snackBarService: SnackbarService,
    private coinsService: CoinsGenericService,
    private vwapService: VwapAlertsGenericService
  ) {}

  fetchVwapAlerts(): Observable<VwapAlert[]> {
    return this.http.get<VwapAlert[]>(VWAP_ALERTS_URLS.vwapAlertsUrl).pipe(
      tap((response) => console.log('✅ Response:', response.length)),
      catchError((error) =>
        this.handleError(error, 'Failed to fetch VWAP alerts')
      )
    );
  }
  // Save anchor point
  saveAnchorPoint(symbol: string, openTime: number): Observable<any> {
    const coins = this.coinsService.getCoins();
    const coin = coins.find((coin: Coin) => coin.symbol === symbol);
    const alert = createVwapAlert(symbol, openTime, coin);
    return this.http
      .post(`${ANCHORED_VWAP_URLS.anchoredPointAddUrl}`, alert)
      .pipe(
        tap({
          next: () => {
            //this.vwapService.getAllAlerts(AlertsCollection.WorkingAlerts);
          },
          error: (error) => {
            this.handleError(error, 'Failed to refresh alerts after saving');
          },
        }),
        catchError((error) =>
          this.handleError(error, 'Failed to save anchor point')
        )
      );
  }

  deleteAnchorPoint(
    symbol: string,
    openTime: number
  ): Observable<{ deletedCount: number }> {
    return this.http
      .post<any>(`${ANCHORED_VWAP_URLS.anchoredPointDeleteUrl}`, {
        symbol,
        openTime,
      })
      .pipe(
        tap({
          next: (result) => {
            if (result.deletedCount === 0) {
              this.showSuccessMessage('No VWAP data found to delete.');
            } else {
              this.showSuccessMessage('VWAP data deleted successfully');
            }
          },
          error: (error) => {
            this.handleError(error, 'Failed to process delete result');
          },
        }),
        tap({
          next: () => {
            this.vwapService.getAllAlerts(AlertsCollection.WorkingAlerts);
          },
          error: (error) => {
            this.handleError(error, 'Failed to refresh alerts after deletion');
          },
        }),
        catchError((error) => {
          return this.handleError(error, 'Failed to delete VWAP data');
        })
      );
  }

  calculateVwap(klines: KlineData[]): [number, number][] {
    let cumulativeVolume = 0;
    let cumulativeVWAP = 0;
    const vwapData: [number, number][] = [];

    klines.forEach((kline) => {
      const {
        openTime,
        openPrice,
        closePrice,
        lowPrice,
        highPrice,
        baseVolume,
      } = kline;
      const typicalPrice = (highPrice + lowPrice + closePrice) / 3; // Average price
      cumulativeVolume += baseVolume;
      cumulativeVWAP += typicalPrice * baseVolume;

      const vwap = cumulativeVWAP / cumulativeVolume;
      vwapData.push([openTime, vwap]);
    });

    return vwapData;
  }

  createVwapSeries(openTime: number, vwapData: [number, number][]): any {
    return {
      name: `VWAP-${openTime}`,
      type: 'line',
      data: vwapData,
      smooth: true,
      lineStyle: { color: 'orange', width: 2 },
      showSymbol: false,
    };
  }

  // Unified error handler with snackbar notifications
  private handleError(error: any, userMessage: string): Observable<never> {
    const errorMessage =
      error.error instanceof ErrorEvent
        ? `Error: ${error.error.message}`
        : `Error Code: ${error.status}\nMessage: ${error.message}`;

    console.error(errorMessage);
    this.snackBarService.showSnackBar(
      userMessage,
      '',
      3000,
      SnackbarType.Error
    );
    return throwError(() => new Error(errorMessage));
  }

  // Centralized method to show success snackbars
  private showSuccessMessage(message: string): void {
    this.snackBarService.showSnackBar(message, '', 3000, SnackbarType.Info);
  }
}
