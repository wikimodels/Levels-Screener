import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NewAlertComponent } from '../alerts/new-alert/new-alert.component';
import {
  ALERTS_AT_WORK,
  TRIGGERED_ALERTS,
  ARCHIVED_ALERTS,
  EXCHANGES,
} from 'src/consts/url-consts';
import { CoinsGenericService } from 'src/service/coins/coins-generic.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css'],
})
export class NavBarComponent implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    private modelDialog: MatDialog,
    private coinsService: CoinsGenericService
  ) {}

  ngOnInit(): void {}
  ngOnDestroy(): void {}

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

  goToExchanges() {
    this.router.navigate([EXCHANGES]);
  }

  onRefreshCoins() {
    this.coinsService.refreshCoins().subscribe();
  }

  onAddAlert() {
    this.modelDialog.open(NewAlertComponent, {
      enterAnimationDuration: 250,
      exitAnimationDuration: 250,
      width: '100vw',
      height: '100vh',
    });
  }
}
