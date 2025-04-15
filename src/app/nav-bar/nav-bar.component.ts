import { Subscription } from 'rxjs';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NewAlertComponent } from '../alerts/new-alert/new-alert.component';
import {
  ALERTS_AT_WORK,
  TRIGGERED_ALERTS,
  ARCHIVED_ALERTS,
  COINS,
  VWAP_ARCHIVED_ALERTS,
  LOGIN,
} from 'src/consts/url-consts';

import { UserData } from 'models/user/user-data';
import { AuthService } from 'src/service/auth.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css'],
})
export class NavBarComponent implements OnInit, OnDestroy {
  userData: UserData = {
    isWhitelisted: false,
    givenName: 'Unknown',
    familyName: 'Unknown',
    email: 'Unknown',
    picture: 'Unknown',
  };
  subscription: Subscription = new Subscription();
  constructor(
    private router: Router,
    private modelDialog: MatDialog,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.authService.userData$.subscribe((userData: UserData) => {
        this.userData = userData;
      })
    );
  }

  onGetToWork() {
    this.router.navigate(['work']);
  }

  goToAlertsAtWork() {
    this.router.navigate([ALERTS_AT_WORK]);
  }

  goToTriggeredAlerts() {
    this.router.navigate([TRIGGERED_ALERTS]);
  }

  goToArchivedAlerts() {
    this.router.navigate([ARCHIVED_ALERTS]);
  }

  goToCoins() {
    this.router.navigate([COINS]);
  }

  goToVwapArchivedAlerts() {
    this.router.navigate([VWAP_ARCHIVED_ALERTS]);
  }

  onAddAlert() {
    this.modelDialog.open(NewAlertComponent, {
      enterAnimationDuration: 250,
      exitAnimationDuration: 250,
      width: '100vw',
      height: '100vh',
    });
  }

  onLogin() {
    this.router.navigate([LOGIN]);
  }

  onLogout() {
    this.authService.logout();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
