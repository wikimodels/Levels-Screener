import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { SnackbarService } from '../snackbar.service';
import { ANCHORED_VWAP_URLS } from 'src/consts/url-consts';
import { SnackbarType } from 'models/shared/snackbar-type';
import { KlineDataService } from '../kline/kline.service';
import { AnchorPoint } from 'models/vwap/anchor-point';

@Injectable({
  providedIn: 'root',
})
export class AnchoredVwapService {
  constructor(
    private http: HttpClient,
    private snackBarService: SnackbarService,
    private klineDataService: KlineDataService
  ) {}

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
  ): Observable<AnchorPoint[]> {
    return this.http
      .post<AnchorPoint[]>(`${ANCHORED_VWAP_URLS.anchoredPointAddUrl}`, {
        symbol,
        openTime,
      })
      .pipe(
        tap((remainingData) => {
          if (remainingData.length === 0) {
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

  getVwap(
    symbol: string,
    openTime: number
  ): Observable<{ time: number; vwap: number }[]> {
    return new Observable((observer) => {
      const klineData = this.klineDataService.getKlineData(symbol);

      if (!klineData || klineData.length === 0) {
        this.snackBarService.showSnackBar(
          `No Kline data available for ${symbol}`,
          '',
          4000,
          SnackbarType.Warning
        );
        observer.error(new Error(`No Kline data available for ${symbol}`));
        return;
      }

      let cumulativePV = 0;
      let cumulativeVolume = 0;
      const vwapData: { time: number; vwap: number }[] = [];

      for (const candle of klineData) {
        if (candle.openTime >= openTime) break; // Stop at future candles

        const typicalPrice =
          (candle.highPrice + candle.lowPrice + candle.closePrice) / 3;
        cumulativePV += typicalPrice * candle.baseVolume;
        cumulativeVolume += candle.baseVolume;

        if (cumulativeVolume > 0) {
          vwapData.push({
            time: candle.openTime, // Make sure this matches x-axis time format
            vwap: cumulativePV / cumulativeVolume,
          });
        }
      }

      if (vwapData.length === 0) {
        this.snackBarService.showSnackBar(
          `No historical VWAP data available.`,
          '',
          4000,
          SnackbarType.Warning
        );
        observer.error(new Error('No historical VWAP data available.'));
        return;
      }

      observer.next(vwapData);
      observer.complete();
    });
  }
}
