import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { AlertsGenericService } from 'src/service/alerts/alerts-generic.service';
import { AlertsCollection } from 'src/app/models/alerts/alerts-collections';
import { Alert } from 'src/app/models/alerts/alert';
import { EditAlertComponent } from 'src/app/edit-alert/edit-alert.component';
import { CoinsGenericService } from 'src/service/coins/coins-generic.service';
import { Subscription } from 'rxjs';
import { CoinLinksService } from 'src/service/coin-links.service';
import { WorkingCoinsService } from 'src/service/coins/working-coins.service';
import { Coin } from 'src/app/models/coin/coin';
import { SWIPER_VIEWER } from 'src/consts/url-consts';
import { Router } from '@angular/router';
import { DialogService } from 'src/service/general/dialog.service';
import { SwiperViewerComponent } from 'src/app/swiper-viewer/swiper-viewer.component';

/**
 * @title Table with sorting
 */

@Component({
  selector: 'app-triggered-alerts-table',
  templateUrl: './triggered-alerts-table.component.html',
  styleUrls: [
    './triggered-alerts-table.component.css',
    './../../../styles-alerts.css',
    './../../../styles-plain-tables.css',
  ],
})
export class TriggeredAlertsTableComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = [
    'symbol',
    'alertName',
    'action',
    // 'low',
    // 'price',
    // 'high',
    'activationTimeStr',
    'links',
    'description',
    //'edit',
    'select',
  ];
  sub!: Subscription | null;
  filterValue = '';
  dataSource!: any;
  buttonsDisabled = true;
  isRotating = false;
  private openedWindows: Window[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  searchKeywordFilter = new FormControl();
  selection = new SelectionModel<any>(true, []);
  constructor(
    private alertsService: AlertsGenericService,
    private matDialog: MatDialog,
    public coinLinksService: CoinLinksService,
    private coinsService: CoinsGenericService,
    private workingCoinsService: WorkingCoinsService,
    private dialogService: DialogService,
    private router: Router
  ) {}

  ngOnInit() {
    window.scrollTo(0, 0);
    this.workingCoinsService.getAllWorkingCoins();
    this.refreshDataTable();
    this.sub = this.alertsService
      .alerts$(AlertsCollection.TriggeredAlerts)
      .subscribe((data: Alert[]) => {
        data.sort((a, b) => {
          if (a.activationTime === undefined) return 1; // Place undefined values last
          if (b.activationTime === undefined) return -1; // Place undefined values last
          return Number(b.activationTime) - Number(a.activationTime); // Sort by activationTime in descending order
        });
        this.dataSource = new MatTableDataSource(data);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      });
  }

  refreshDataTable() {
    this.alertsService.getAllAlerts(AlertsCollection.TriggeredAlerts);
    this.isRotating = true;
    setTimeout(() => {
      this.isRotating = false;
    }, 1000);
  }

  // Filter function
  applyFilter(event: KeyboardEvent) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  onDataToggled(data: any) {
    this.selection.toggle(data);
    this.buttonsDisabled = this.selection.selected.length > 0 ? false : true;
  }
  // Toggle "Select All" checkbox
  toggleAll() {
    if (this.isAllSelected()) {
      this.selection.clear();
      this.buttonsDisabled = true;
    } else {
      this.selection.select(...this.dataSource.data);
      this.buttonsDisabled = false;
    }
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length; // Use dataSource.data.length
    return numSelected === numRows;
  }

  onOpenDescriptionModalDialog(alert: Alert): void {
    if (!alert) {
      console.error('No alert selected. Cannot open modal.');
      return;
    }

    this.dialogService.openFullScreenDialog(SwiperViewerComponent, alert);
  }

  onEdit(alert: Alert) {
    this.matDialog.open(EditAlertComponent, {
      data: { collectionName: AlertsCollection.TriggeredAlerts, alert: alert },
      enterAnimationDuration: 250,
      exitAnimationDuration: 250,
      width: '95vw',
      height: '100vh',
    });
  }

  onShowScreens(alert: Alert): void {
    if (!alert) {
      console.error('No alert selected. Cannot open modal.');
      return;
    }
    this.router.navigate([SWIPER_VIEWER], { state: { alert } });
  }

  onDeleteSelected() {
    const alerts = this.selection.selected as Alert[];
    const ids = alerts.map((a) => a.id);
    this.alertsService.deleteMany(AlertsCollection.TriggeredAlerts, ids);
    this.selection.clear();
    this.buttonsDisabled = true;
  }

  clearInput() {
    this.filterValue = '';
    this.dataSource.filter = this.filterValue.trim().toLowerCase();
  }

  onMoveToWorkingCoins() {
    const selectedAlerts = this.selection.selected as Alert[];
    const selectedSymbols = new Set(selectedAlerts.map((a) => a.symbol)); // Use a Set for efficiency
    console.log(selectedSymbols);

    const coins = this.coinsService.getCoins();
    console.log('Coins', coins.length);
    const workingCoins = new Set(
      this.workingCoinsService.getCoins().map((c) => c.symbol)
    ); // Convert to Set for fast lookup
    console.log('WorkingCoins', this.workingCoinsService);

    // 🔹 Find coins whose symbol is in selectedSymbols but NOT in workingCoins
    const triggeredCoins = coins.filter(
      (coin: Coin) =>
        selectedSymbols.has(coin.symbol) && !workingCoins.has(coin.symbol)
    );
    if (triggeredCoins.length > 0) {
      this.workingCoinsService.addWorkingCoin(triggeredCoins[0]);
    }
    console.log('Triggered Coins --> ', triggeredCoins);

    this.selection.clear();
    this.buttonsDisabled = true;
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
