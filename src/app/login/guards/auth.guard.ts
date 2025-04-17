import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from 'src/app/login/service/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const isAuthenticated = this.authService.isAuthenticated();

    if (isAuthenticated) {
      // If the user is authenticated and the token is valid, allow access to the route
      return true;
    } else {
      // Handle invalid or expired tokens
      this.authService.handleInvalidToken();
      return false; // Deny access to the route
    }
  }
}
