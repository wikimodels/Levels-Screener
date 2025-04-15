import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core'; // Import NgZone
import { BehaviorSubject, Observable, catchError, tap, throwError } from 'rxjs';
import { jwtDecode } from 'jwt-decode'; // Import jwt-decode for token decoding
import { SnackbarType } from 'models/shared/snackbar-type';
import { GENERAL_URLS, LOGIN } from 'src/consts/url-consts';
import { SnackbarService } from './snackbar.service';
import { UserData } from 'models/user/user-data';
import { Router } from '@angular/router';

declare const google: any;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  noname: UserData = {
    isWhitelisted: false,
    givenName: 'Unknown',
    familyName: 'Unknown',
    email: 'Unknown',
    picture: 'Unknown',
  };
  private userDataSubject = new BehaviorSubject<UserData>(this.noname);
  public userData$ = this.userDataSubject.asObservable();

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }),
  };

  constructor(
    private http: HttpClient,
    private snackbarService: SnackbarService,
    private router: Router,
    private ngZone: NgZone // Inject NgZone
  ) {}

  /**
   * Authenticates the user by sending the token to the backend.
   */
  public authenticateUser(token: string): Observable<UserData> {
    if (!this.isTokenValid(token)) {
      this.handleInvalidToken();
      return throwError(() => new Error('Invalid or expired token'));
    }

    return this.http
      .post<UserData>(GENERAL_URLS.userAuthUrl, { token }, this.httpOptions)
      .pipe(
        tap((userData: UserData) => {
          // Store the token securely
          localStorage.setItem('authToken', token);

          // Update the user data in the BehaviorSubject
          this.userDataSubject.next(userData);

          // Show a warning if the user is not whitelisted
          if (!userData.isWhitelisted) {
            this.snackbarService.showSnackBar(
              `${userData.givenName}, you are not welcome here!`,
              '',
              3000,
              SnackbarType.Warning
            );
          }
        }),
        catchError((error) => this.handleError(error))
      );
  }

  /**
   * Logs out the user.
   */
  logout(): void {
    // Revoke the Google token
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      google.accounts.id.revoke(authToken, (response: any) => {
        console.log('Google token revoked:', response);

        // Clear local session data
        localStorage.removeItem('authToken');
        this.userDataSubject.next(this.noname);

        // Redirect to the login page within Angular's zone
        this.ngZone.run(() => {
          this.router.navigate([LOGIN]);
        });
      });
    } else {
      // If no token exists, redirect directly
      this.ngZone.run(() => {
        this.router.navigate([LOGIN]);
      });
    }
  }

  /**
   * Checks if the user is authenticated.
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    return !!token && this.isTokenValid(token); // Ensure the token exists and is valid
  }

  /**
   * Decodes the token and checks its expiration time.
   */
  private isTokenValid(token: string): boolean {
    try {
      const decodedToken: any = jwtDecode(token);
      const currentTime = Date.now() / 1000; // Current time in seconds
      return decodedToken.exp > currentTime; // Check if the token is not expired
    } catch (error) {
      console.error('Error decoding token:', error);
      return false; // Invalid token
    }
  }

  /**
   * Handles invalid or expired tokens.
   */
  private handleInvalidToken(): void {
    // Clear the invalid token
    localStorage.removeItem('authToken');

    // Notify the user
    this.snackbarService.showSnackBar(
      'Your session has expired. Please log in again.',
      '',
      5000,
      SnackbarType.Error
    );

    // Redirect to the login page within Angular's zone
    this.ngZone.run(() => {
      this.router.navigate([LOGIN]);
    });
  }

  /**
   * Handles errors during authentication.
   */
  private handleError(error: Error): Observable<never> {
    console.error('An error occurred:', error);
    const msg = 'Authentication failed: ' + error.message;
    this.snackbarService.showSnackBar(msg, '', 8000, SnackbarType.Error);
    return throwError(() => new Error('Something went wrong!', error));
  }
}
