import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { LOGIN } from 'src/consts/url-consts';
import { AuthService } from 'src/app/login/service/auth.service';
import { UserData } from '../model/user/user-data';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
})
export class UserProfileComponent implements OnInit, OnDestroy {
  @Input() userData: UserData = {
    isWhitelisted: false,
    givenName: 'Unknown',
    familyName: 'Unknown',
    email: 'Unknown',
    picture: 'Unknown',
  };

  private subscription!: Subscription;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.subscription = this.authService.userData$.subscribe((data) => {
      this.userData = data || this.userData;
    });
  }

  onLogout(): void {
    this.authService.logout();
  }

  onGoToLogin(): void {
    this.router.navigate([LOGIN]);
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
