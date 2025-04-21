import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../service/auth.service';
AuthService;

@Injectable({
  providedIn: 'root', // Make the guard available throughout the app
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.authService.isAuthenticated().pipe(
      take(1), // Take only the first emitted value and complete
      map((isAuthenticated: boolean) => {
        if (isAuthenticated) {
          return true; // Allow access to the route
        } else {
          this.router.navigate(['/login']); // Redirect to login page if not authenticated
          return false;
        }
      })
    );
  }
}
