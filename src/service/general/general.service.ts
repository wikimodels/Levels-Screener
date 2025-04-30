import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { SnackbarService } from '../snackbar.service';

import { SnackbarType } from 'src/app/models/shared/snackbar-type';
import { GENERAL_URLS, COINS_URLS } from 'src/consts/url-consts';

@Injectable({ providedIn: 'root' })
export class GeneralService {
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }),
  };

  constructor(
    private http: HttpClient,
    private snackbarService: SnackbarService
  ) {}

  public refreshAlertsRepos(): void {
    const options = { ...this.httpOptions };
    this.http.get<any>(GENERAL_URLS.refreshAlertsReposUrl, options).subscribe({
      next: (data) => {
        console.log('general.service refreshAlertsRepos ', data);
        this.snackbarService.showSnackBar(
          'Alerts Repos refreshed',
          '',
          3000,
          SnackbarType.Info
        );
      },
      error: (error) => this.handleError(error),
    });
  }

  public refreshCoinsRepo(): void {
    const options = { ...this.httpOptions };
    this.http.get<any>(COINS_URLS.coinsRefreshUrl, options).subscribe({
      next: (data) => {
        console.log('general.service refreshAlertsRepos ', data);
        this.snackbarService.showSnackBar(
          'Coins Repo refreshed',
          '',
          3000,
          SnackbarType.Info
        );
      },
      error: (error) => this.handleError(error),
    });
  }

  public refreshDopplerConfig(): void {
    const options = { ...this.httpOptions };
    this.http
      .get<any>(GENERAL_URLS.refreshDopplerConfigUrl, options)
      .subscribe({
        next: (data) => {
          console.log('general.service RefreshDopplerConfig', data);
          this.snackbarService.showSnackBar(
            'Config refreshed',
            '',
            3000,
            SnackbarType.Info
          );
        },
        error: (error) => this.handleError(error),
      });
  }

  public cleanTriggeredAlerts(): void {
    const options = { ...this.httpOptions };
    this.http
      .get<any>(GENERAL_URLS.cleanTriggeredAlertsUrl, options)
      .subscribe({
        next: (data) => {
          console.log('general.service cleanTriggeredAlerts', data);
          this.snackbarService.showSnackBar(
            'Triggered Alerts are cleaned up',
            '',
            3000,
            SnackbarType.Info
          );
        },
        error: (error) => this.handleError(error),
      });
  }

  public getConfig(): Observable<string> {
    const options = { ...this.httpOptions };
    return this.http.get<any>(GENERAL_URLS.configUrl, options).pipe(
      tap(() => {
        console.log('getConfig');
      }),
      catchError((error) => this.handleError(error))
    );
  }

  //---------------------------------------------
  // ✅ ERROR HANDLING
  //---------------------------------------------
  private handleError(error: Error): Observable<never> {
    console.error('An error occurred:', error);
    const msg = 'ERROR: ' + error.message;
    this.snackbarService.showSnackBar(msg, '', 8000, SnackbarType.Error);
    return throwError(() => new Error('Something went wrong! ', error));
  }
}
