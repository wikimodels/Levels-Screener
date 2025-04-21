import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  catchError,
  from,
  map,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { initializeApp, getApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  User,
  signInWithCredential,
} from 'firebase/auth';

import { SnackbarType } from 'src/app/models/shared/snackbar-type';
import { GENERAL_URLS, LOGIN } from 'src/consts/url-consts';
import { Router } from '@angular/router';

import { SnackbarService } from 'src/service/snackbar.service';
import { UserData } from '../model/user/user-data';
import { env } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth: ReturnType<typeof getAuth>; // Use modular Auth type
  private defaultUser: UserData = {
    isWhitelisted: false,
    givenName: 'Unknown',
    familyName: 'Unknown',
    email: 'Unknown',
    picture: 'Unknown',
  };

  private userDataSubject = new BehaviorSubject<UserData>(this.defaultUser);
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
  ) {
    const app = !getApps().length
      ? initializeApp(env.firebaseConfig)
      : getApp();
    this.auth = getAuth(app); // Initialize auth using modular API

    // Automatically handle authentication state
    this.onAuthStateChanged();
  }

  /**
   * Listen to authentication state changes
   */
  private onAuthStateChanged(): void {
    this.auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        this.handleFirebaseUser(firebaseUser).subscribe();
      } else {
        this.handleNoUser().subscribe();
      }
    });
  }

  /**
   * Google Sign-In through Firebase Modular API
   */
  signInWithGoogle(): Observable<any> {
    const provider = new GoogleAuthProvider(); // Use modular GoogleAuthProvider
    return from(signInWithPopup(this.auth, provider)).pipe(
      switchMap((result) => {
        const firebaseUser = result.user;
        console.log('Firebase ID token:', firebaseUser.getIdToken());
        const userData: UserData = {
          ...this.mapFirebaseUser(firebaseUser),
        };
        console.log(userData);
        return from(firebaseUser.getIdToken()).pipe(
          switchMap((token) =>
            this.validateEmailWithBackend(userData.email).pipe(
              map((backendEmailData) => ({
                ...userData,
                ...backendEmailData,
              }))
            )
          )
        );
      }),
      tap((userData) => {
        console.log('User data:', userData);
        if (!userData.isWhitelisted) {
          this.snackbarService.showSnackBar(
            `${userData.givenName}, you are not welcome here`,
            '',
            3000,
            SnackbarType.Info
          );
          this.logout();
          return;
        } else {
          this.userDataSubject.next(userData);
          this.ngZone.run(() => this.router.navigate(['/']));
        }
      }),
      catchError((error) => this.handleError(error))
    );
  }

  /**
   * Validate email with backend
   */

  signInWithGoogleIdToken(idToken: string): Observable<any> {
    const credential = GoogleAuthProvider.credential(idToken); // Create credential [[7]]
    return from(signInWithCredential(this.auth, credential)).pipe(
      // Convert Promise to Observable [[1]]
      switchMap((result) => {
        const firebaseUser = result.user;
        const userData: UserData = {
          ...this.mapFirebaseUser(firebaseUser),
        };
        return from(firebaseUser.getIdToken()).pipe(
          // Extract ID token [[9]]
          switchMap((token) =>
            this.validateEmailWithBackend(userData.email).pipe(
              // Validate email with backend
              map((backendEmailData) => ({
                ...userData,
                ...backendEmailData,
              }))
            )
          )
        );
      }),
      tap((userData) => {
        if (!userData.isWhitelisted) {
          this.snackbarService.showSnackBar(
            // Handle unauthorized users [[5]]
            `${userData.givenName}, you are not welcome here`,
            '',
            3000,
            SnackbarType.Info
          );
          this.logout();
        } else {
          this.userDataSubject.next(userData); // Update user data [[2]]
          this.ngZone.run(() => this.router.navigate(['/'])); // Navigate [[5]]
        }
      }),
      catchError((error) => this.handleError(error)) // Error handling [[6]]
    );
  }

  private validateEmailWithBackend(email: string): Observable<UserData> {
    console.log('User email', email);
    return this.http
      .post<UserData>(
        GENERAL_URLS.emailValidationUrl,
        { email },
        this.httpOptions
      )
      .pipe(
        tap((data) => {
          console.log('Backend response:', data);
        })
      );
  }

  private handleFirebaseUser(firebaseUser: User): Observable<UserData> {
    // Ensure email is not null; fallback to a default value if necessary
    const email = firebaseUser.email || 'unknown';

    // Simulate backend validation or processing (replace with actual backend call)
    return this.validateEmailWithBackend(email).pipe(
      map((backendUserData) => ({
        ...this.mapFirebaseUser(firebaseUser),
        ...backendUserData,
      })),
      tap((userData) => {
        this.userDataSubject.next(userData); // Update userData$
      }),
      catchError((error) => {
        console.error('Error handling Firebase user:', error);
        return throwError(() => new Error('Failed to process user data'));
      })
    );
  }

  /**
   * Map Firebase User to UserData
   */
  private mapFirebaseUser(user: User): UserData {
    return {
      isWhitelisted: false, // Temporary value, will be overwritten by backend
      givenName: user.displayName?.split(' ')[0] || 'Unknown',
      familyName: user.displayName?.split(' ')[1] || 'Unknown',
      email: user.email || 'Unknown',
      picture: user.photoURL || this.generateAvatar(user.email || 'unknown'),
    };
  }

  /**
   * Logout
   */
  logout(): void {
    this.auth.signOut().then(() => {
      this.userDataSubject.next(this.defaultUser);
      this.ngZone.run(() => this.router.navigate([LOGIN]));
      // On logout, add this:
      // if (window.google?.accounts?.id) {
      //   window.google.accounts.id.disableAutoSelect(); // Clear cached credentials [[5]][[8]]
      //   const userEmail = this.userDataSubject.value.email;
      //   if (window.google?.accounts?.id && userEmail) {
      //     window.google.accounts.id.revoke(userEmail, (done: any) => {}); // [[3]][[8]]
      //   }
      // }
    });
  }

  /**
   * Check Authentication
   */
  isAuthenticated(): Observable<boolean> {
    return new Observable((observer) => {
      this.auth.onAuthStateChanged((user) => {
        observer.next(!!user);
      });
    });
  }

  /**
   * Generate Avatar
   */
  private generateAvatar(email: string): string {
    const seed = email.split('@')[0];
    return `https://api.dicebear.com/7.x/identicon/svg?seed=${seed}&size=64`;
  }

  /**
   * Handle No User
   */
  private handleNoUser(): Observable<never> {
    this.userDataSubject.next(this.defaultUser);
    console.log('Default user data:', this.defaultUser);
    return throwError(() => new Error('No user'));
  }

  /**
   * Handle Errors
   */
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
