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
  constructor(private generalService: GeneralService) {}
  ngOnInit(): void {
    this.subscription.add(
      this.generalService.getConfig().subscribe((data) => {
        this.jsonString = JSON.stringify(data, null, 2);
      })
    );
  }

  onRefreshCoins() {
    this.generalService.refreshCoinsRepo();
  }

  onRefreshConfig() {
    this.generalService.refreshDopplerConfig();
  }

  onCleanTriggeredAlerts() {
    this.generalService.cleanTriggeredAlerts();
  }

  onGetDConfig() {
    this.generalService.getConfig().subscribe((data) => {
      this.jsonString = JSON.stringify(data, null, 2);
    });
  }

  onrefreshAlertsRepos() {
    this.generalService.refreshAlertsRepos();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
