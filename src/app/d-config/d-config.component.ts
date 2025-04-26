import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { GeneralService } from 'src/service/general/general.service';

@Component({
  selector: 'app-d-config',
  templateUrl: './d-config.component.html',
  styleUrls: ['./d-config.component.css'],
})
export class DConfigComponent implements OnInit, OnDestroy {
  jsonString = '';
  subscription = new Subscription();
  constructor(
    private generalService: GeneralService,
    private coinsService: GeneralService
  ) {}
  ngOnInit(): void {
    this.subscription.add(
      this.generalService.getConfig().subscribe((data) => {
        this.jsonString = JSON.stringify(data, null, 2);
      })
    );
  }

  onRefreshCoins() {
    this.coinsService.refreshRepos();
  }

  onRefreshConfig() {
    this.coinsService.refreshDopplerConfig();
  }

  onCleanTriggeredAlerts() {
    this.coinsService.cleanTriggeredAlerts();
  }

  onGoToDConfig() {
    this.generalService.getConfig().subscribe((data) => {
      this.jsonString = JSON.stringify(data, null, 2);
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
