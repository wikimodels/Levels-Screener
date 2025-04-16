import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable, catchError, tap, throwError } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { SnackbarType } from 'models/shared/snackbar-type';
import { GENERAL_URLS, LOGIN } from 'src/consts/url-consts';
import { SnackbarService } from './snackbar.service';
import { UserData } from 'models/user/user-data';
import { Router } from '@angular/router';

declare const google: any;

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Default user data with fallback avatar
  private defaultUser: UserData = {
    isWhitelisted: false,
    givenName: 'Guest',
    familyName: 'User',
    email: 'unknown@example.com',
    picture: 'https://example.com/default-avatar.png', // Add your default avatar URL
  };

  private userDataSubject = new BehaviorSubject<UserData>(
    this.getPersistedUserData() || this.defaultUser // Initialize from storage
  );
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
    private ngZone: NgZone
  ) {}

  /**
   * Authenticates the user and persists session data
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
          // Persist both token and user data
          localStorage.setItem('authToken', token);
          this.persistUserData(userData); // Store user data

          // Handle missing picture URL
          if (!userData.picture) {
            userData.picture = this.generateAvatar(userData.email);
          }

          this.userDataSubject.next(userData);

          if (!userData.isWhitelisted) {
            this.showWhitelistWarning(userData.givenName);
          }
        }),
        catchError((error) => this.handleError(error))
      );
  }

  /**
   * Logout with full session cleanup
   */
  logout(): void {
    const authToken = localStorage.getItem('authToken');

    const cleanup = () => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      this.userDataSubject.next(this.defaultUser);
      this.ngZone.run(() => this.router.navigate([LOGIN]));
    };

    if (authToken) {
      google.accounts.id.revoke(authToken, (response: any) => {
        console.log('Google token revoked:', response);
        cleanup();
      });
    } else {
      cleanup();
    }
  }

  /**
   * Session persistence methods
   */
  private persistUserData(userData: UserData): void {
    localStorage.setItem('userData', JSON.stringify(userData));
  }

  private getPersistedUserData(): UserData | null {
    const storedData = localStorage.getItem('userData');
    return storedData ? JSON.parse(storedData) : null;
  }

  /**
   * Avatar generation for missing pictures
   */
  private generateAvatar(email: string): string {
    // Example using DiceBear avatars
    const seed = email.split('@')[0];
    return `https://api.dicebear.com/7.x/identicon/svg?seed=${seed}&size=64`;
  }

  /**
   * Token validation with storage check
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    if (!token) return false;

    const isValid = this.isTokenValid(token);
    if (!isValid) this.handleInvalidToken();
    return isValid;
  }

  /**
   * Enhanced token validation
   */
  private isTokenValid(token: string): boolean {
    try {
      const decoded = jwtDecode(token);
      return decoded.exp! > Date.now() / 1000;
    } catch {
      return false;
    }
  }

  /**
   * Invalid token handler
   */
  handleInvalidToken(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    this.userDataSubject.next(this.defaultUser);

    this.snackbarService.showSnackBar(
      'Session expired. Please login again.',
      '',
      5000,
      SnackbarType.Error
    );

    this.ngZone.run(() => this.router.navigate([LOGIN]));
  }

  /**
   * Whitelist warning helper
   */
  private showWhitelistWarning(name: string): void {
    this.snackbarService.showSnackBar(
      `${name}, you are not welcome here!`,
      '',
      3000,
      SnackbarType.Warning
    );
  }

  // Keep existing error handler
  private handleError(error: Error): Observable<never> {
    console.error('Authentication error:', error);
    this.snackbarService.showSnackBar(
      `Login failed: ${error.message}`,
      '',
      8000,
      SnackbarType.Error
    );
    return throwError(() => error);
  }
}
