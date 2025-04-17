import { MatMenuModule } from '@angular/material/menu'; // For mat-menu/matMenuTriggerFor
import { MatToolbarModule } from '@angular/material/toolbar'; // For mat-toolbar
import { MatButtonModule } from '@angular/material/button'; // For mat-button/mat-icon-button
import { MatIconModule } from '@angular/material/icon'; // For mat-icon
import { MatTooltipModule } from '@angular/material/tooltip'; // For matTooltip
import { Subscription } from 'rxjs';
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
  LOGIN,
} from 'src/consts/url-consts';

import { UserData } from 'models/user/user-data';
import { AuthService } from 'src/app/login/service/auth.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css'],
})
export class NavBarComponent implements OnInit, OnDestroy {
  subscription: Subscription = new Subscription();
  constructor(private router: Router, private modelDialog: MatDialog) {}

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
    this.modelDialog.open(NewAlertComponent, {
      enterAnimationDuration: 250,
      exitAnimationDuration: 250,
      width: '100vw',
      height: '100vh',
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
