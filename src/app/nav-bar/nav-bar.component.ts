import { MatMenuModule } from '@angular/material/menu'; // For mat-menu/matMenuTriggerFor
import { MatToolbarModule } from '@angular/material/toolbar'; // For mat-toolbar
import { MatButtonModule } from '@angular/material/button'; // For mat-button/mat-icon-button
import { MatIconModule } from '@angular/material/icon'; // For mat-icon
import { MatTooltipModule } from '@angular/material/tooltip'; // For matTooltip
import { Subscription, take } from 'rxjs';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NewAlertComponent } from 'src/app/new-alert/new-alert.component';
import {
  ALERTS_AT_WORK,
  TRIGGERED_ALERTS,
  ARCHIVED_ALERTS,
  COINS,
  VWAP_ARCHIVED_ALERTS,
} from 'src/consts/url-consts';
import { AuthService } from '../login/service/auth.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css'],
})
export class NavBarComponent implements OnInit, OnDestroy {
  subscription: Subscription = new Subscription();
  constructor(
    private router: Router,
    private modelDialog: MatDialog,
    private authService: AuthService
  ) {}

  ngOnInit(): void {}

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
    this.authService
      .isAuthenticated()
      .pipe(take(1))
      .subscribe({
        next: (authenticated) => {
          if (authenticated) {
            this.modelDialog.open(NewAlertComponent, {
              enterAnimationDuration: 250,
              exitAnimationDuration: 250,
              width: '100vw',
              height: '100vh',
            });
          } else {
            this.router.navigate(['/login']);
            // Optional: Add notification about needing to login
          }
        },
        error: (err) => {
          console.error('Auth check failed:', err);
          this.router.navigate(['/login']);
        },
      });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
