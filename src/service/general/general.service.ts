import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { SnackbarService } from '../snackbar.service';

import { SnackbarType } from 'models/shared/snackbar-type';
import { GENERAL_URLS } from 'src/consts/url-consts';

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

  public refreshRepos(): void {
    const options = { ...this.httpOptions };
    this.http.get<any>(GENERAL_URLS.refreshReposUrl, options).subscribe({
      next: (data) => {
        console.log('general.service RefreshRepos ', data);
        this.snackbarService.showSnackBar(
          'Repos refreshed',
          '',
          3000,
          SnackbarType.Info
        );
      },
      error: (error) => this.handleError(error),
    });
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
