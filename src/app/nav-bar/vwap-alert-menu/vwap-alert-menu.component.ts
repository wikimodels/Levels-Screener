import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  VWAP_ALERTS_AT_WORK,
  VWAP_ARCHIVED_ALERTS,
  VWAP_TRIGGERED_ALERTS,
} from 'src/consts/url-consts';

@Component({
  selector: 'app-vwap-alert-menu',
  templateUrl: './vwap-alert-menu.component.html',
  styleUrls: ['./vwap-alert-menu.component.css'],
})
export class VwapAlertMenuComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {}

  goToAlertsAtWork() {
    this.router.navigate([VWAP_ALERTS_AT_WORK]);
  }

  goToTriggeredAlerts() {
    this.router.navigate([VWAP_TRIGGERED_ALERTS]);
  }

  goToArchivedAlerts() {
    this.router.navigate([VWAP_ARCHIVED_ALERTS]);
  }
}
