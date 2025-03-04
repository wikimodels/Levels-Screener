import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { SnackbarService } from '../snackbar.service';
import {
  DeleteResult,
  InsertResult,
  ModifyResult,
} from 'models/mongodb/operations';
import { SnackbarType } from 'models/shared/snackbar-type';
import { WORKING_COINS_URLS } from 'src/consts/url-consts';
import { Coin } from 'models/coin/coin';

@Injectable({ providedIn: 'root' })
export class WorkingCoinsService {
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }),
  };

  private coinsSubject = new BehaviorSubject<Coin[]>([]);
  public coins$ = this.coinsSubject.asObservable(); // Expose observable for real-time updates

  constructor(
    private http: HttpClient,
    private snackbarService: SnackbarService
  ) {}

  //---------------------------------------------
  // ✅ GET ALL WORKING COINS
  //---------------------------------------------
  public getAllWorkingCoins(): void {
    this.http
      .get<Coin[]>(WORKING_COINS_URLS.workingCoinsUrl, this.httpOptions)
      .pipe(
        tap((coins: Coin[]) => this.coinsSubject.next(coins)),
        catchError((error) => this.handleError(error))
      )
      .subscribe();
  }

  //---------------------------------------------
  // ✅ ADD WORKING COIN
  //---------------------------------------------
  public addWorkingCoin(coin: Coin): void {
    const currentCoins = this.coinsSubject.getValue();
    this.coinsSubject.next([...currentCoins, coin]);

    this.http
      .post<InsertResult>(
        WORKING_COINS_URLS.addWorkingCoinsUrl,
        coin,
        this.httpOptions
      )
      .pipe(
        tap((response) => {
          const msg = `Document inserted: ${response.insertedCount}`;
          this.snackbarService.showSnackBar(msg, '');
        }),
        catchError((error) => this.handleError(error))
      )
      .subscribe();
  }

  //---------------------------------------------
  // ✅ DELETE WORKING COINS
  //---------------------------------------------
  public deleteWorkingCoins(symbols: string[]): void {
    const updatedCoins = this.coinsSubject
      .getValue()
      .filter((coin) => !symbols.includes(coin.symbol));
    this.coinsSubject.next(updatedCoins);

    const options = {
      ...this.httpOptions,
      body: { symbols }, // Ensure backend supports body in DELETE requests
    };

    this.http
      .delete<DeleteResult>(WORKING_COINS_URLS.deleteWorkingCoinsUrl, options)
      .pipe(
        tap((response) => {
          const msg = `Documents deleted: ${response.deletedCount}`;
          this.snackbarService.showSnackBar(msg, '');
        }),
        catchError((error) => this.handleError(error))
      )
      .subscribe();
  }

  //---------------------------------------------
  // ✅ UPDATE WORKING COIN
  //---------------------------------------------
  public updateWorkingCoin(updatedCoin: Coin): void {
    const updatedCoins = this.coinsSubject
      .getValue()
      .map((coin) =>
        coin.symbol === updatedCoin.symbol ? { ...coin, ...updatedCoin } : coin
      );
    this.coinsSubject.next(updatedCoins);

    this.http
      .put<ModifyResult>(
        WORKING_COINS_URLS.updateWorkingCoinUrl,
        updatedCoin,
        this.httpOptions
      )
      .pipe(
        tap((response) => {
          const msg = `Documents modified: ${response.modifiedCount}`;
          this.snackbarService.showSnackBar(msg, '');
        }),
        catchError((error) => this.handleError(error))
      )
      .subscribe();
  }

  //---------------------------------------------
  // ✅ ERROR HANDLING
  //---------------------------------------------
  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    const msg = 'ERROR: ' + error.message;
    this.snackbarService.showSnackBar(msg, '', 8000, SnackbarType.Error);
    return throwError(
      () => new Error('Something went wrong! ' + error.message)
    );
  }

  //---------------------------------------------
  // ✅ STATE MANAGEMENT HELPERS
  //---------------------------------------------
  public getCoinsObservable(): Observable<Coin[]> {
    return this.coins$;
  }

  public setCoins(coins: Coin[]): void {
    this.coinsSubject.next(coins);
  }

  public getCoins(): Coin[] {
    return this.coinsSubject.getValue();
  }
}
