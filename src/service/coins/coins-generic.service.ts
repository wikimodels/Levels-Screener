import {
  HttpClient,
  HttpHeaders,
  HttpParams,
  HttpErrorResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  Observable,
  BehaviorSubject,
  throwError,
  tap,
  catchError,
  of,
} from 'rxjs';
import { Coin } from 'src/app/models/coin/coin';
import { SnackbarService } from '../snackbar.service';
import { COINS_URLS } from 'src/consts/url-consts';
import { SnackbarType } from 'src/app/models/shared/snackbar-type';

@Injectable({ providedIn: 'root' })
export class CoinsGenericService {
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }),
  };

  private coinsSubject = new BehaviorSubject<Coin[]>([]);
  public coins$ = this.coinsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private snackbarService: SnackbarService
  ) {}

  public setCoins(coins: Coin[]): void {
    this.coinsSubject.next(coins);
  }

  public getCoins(): Coin[] {
    return this.coinsSubject.value;
  }

  getAsyncCoins(): Observable<Coin[]> {
    return of(this.coinsSubject.value);
  }

  public loadCoins(): Observable<Coin[]> {
    return this.http.get<any>(COINS_URLS.coinsUrl, this.httpOptions).pipe(
      tap((coins) => {
        coins;
        this.setCoins(coins); // Update state
      }),
      catchError((error) => this.handleError(error)) // Handle errors properly
    );
  }

  public refreshCoins() {
    this.http
      .get<any>(COINS_URLS.coinsRefreshUrl, this.httpOptions)
      .pipe(
        catchError((error) => this.handleError(error)) // Handle errors properly
      )
      .subscribe({
        next: (coins) => {
          console.log('coins-generic.service RefreshCoins ', coins.length);
          this.setCoins(coins); // Update state
          this.snackbarService.showSnackBar(
            'Coins refreshed',
            '',
            3000,
            SnackbarType.Info
          );
          // Additional logic for successful response, if needed
        },
        error: (err) => {
          console.error('coins-generic.service RefreshCoins - error', err);
          // Additional error handling logic, if needed
        },
        complete: () => {
          console.log('coins-generic.service RefreshCoins - complete');
          // Logic to execute when the observable completes, if needed
        },
      });
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('An error occurred:', error);
    const msg =
      error.error?.message || `HTTP Error: ${error.status} ${error.statusText}`;
    this.snackbarService.showSnackBar(msg, '', 8000, SnackbarType.Error);
    return throwError(() => new Error(msg));
  }
}
