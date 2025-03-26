import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { SnackbarService } from '../snackbar.service';
import { ANCHORED_VWAP_URLS } from 'src/consts/url-consts';
import { SnackbarType } from 'models/shared/snackbar-type';
import { KlineDataService } from '../kline/kline.service';
import { AnchorPoint } from 'models/vwap/anchor-point';
import { KlineData } from 'models/kline/kline-data';

@Injectable({
  providedIn: 'root',
})
export class AnchoredVwapService {
  constructor(
    private http: HttpClient,
    private snackBarService: SnackbarService
  ) {}

  // Centralized method to show success snackbars
  private showSuccessMessage(message: string): void {
    this.snackBarService.showSnackBar(message, '', 3000, SnackbarType.Info);
  }

  // Save anchor point
  saveAnchorPoint(symbol: string, openTime: number): Observable<any> {
    return this.http
      .post(`${ANCHORED_VWAP_URLS.anchoredPointAddUrl}`, { symbol, openTime })
      .pipe(
        tap(() => this.showSuccessMessage('Anchor point saved successfully!')),
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
      .post<any>(`${ANCHORED_VWAP_URLS.anchoredVwapDeleteUrl}`, {
        symbol,
        openTime,
      })
      .pipe(
        tap((result) => {
          if (result.deletedCount === 0) {
            this.showSuccessMessage('No VWAP data found to delete.');
          } else {
            this.showSuccessMessage('VWAP data deleted successfully');
          }
        }),
        catchError((error) => {
          this.handleError(error, 'Failed to delete VWAP data');
          return throwError(() => new Error('Failed to delete VWAP data'));
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
}
