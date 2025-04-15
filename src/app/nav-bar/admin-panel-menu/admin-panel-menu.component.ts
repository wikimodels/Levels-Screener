import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ALERTS_BATCH, EXCHANGES } from 'src/consts/url-consts';
import { GeneralService } from 'src/service/general/general.service';

@Component({
  selector: 'app-admin-panel-menu',
  templateUrl: './admin-panel-menu.component.html',
  styleUrls: ['./admin-panel-menu.component.css'],
})
export class AdminPanelMenuComponent {
  constructor(
    private router: Router,
    private generalService: GeneralService,
    private coinsService: GeneralService
  ) {}

  goToAlertsBatch() {
    this.router.navigate([ALERTS_BATCH]);
  }

  goToExchanges() {
    this.router.navigate([EXCHANGES]);
  }

  onRefreshRepos() {
    this.generalService.refreshRepos();
  }

  onRefreshCoins() {
    this.coinsService.refreshRepos();
  }

  onRefreshConfig() {
    this.coinsService.refreshDopplerConfig();
  }
}
