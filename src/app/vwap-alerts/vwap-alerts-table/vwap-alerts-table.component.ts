import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { SelectionModel } from '@angular/cdk/collections';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DescriptionModalComponent } from 'src/app/shared/description-modal/description-modal.component';
import { TooltipPosition } from '@angular/material/tooltip';
import { AlertsCollection } from 'models/alerts/alerts-collections';
import { Alert } from 'models/alerts/alert';
import { Subscription } from 'rxjs';
import { CoinLinksService } from 'src/service/coin-links.service';
import { VwapAlertsGenericService } from 'src/service/vwap-alerts/vwap-alerts-generic.service';
import { VwapAlert } from 'models/vwap/vwap-alert';
import { Router } from '@angular/router';
import { LIGHTWEIGHT_CHART } from 'src/consts/url-consts';
import { EditVwapAlertComponent } from 'src/app/shared/edit-vwap-alert/edit-vwap-alert.component';
import { Coin } from 'models/coin/coin';

@Component({
  selector: 'app-vwap-alerts-table',
  templateUrl: './vwap-alerts-table.component.html',
  styleUrls: [
    './vwap-alerts-table.component.css',
    './../../../styles-alerts.css',
    './../../../styles-vwap-tables.css',
  ],
})
export class VwapAlertsTableComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = [
    'symbol',
    'anchorTimeStr',
    'links',
    'isActive',
    'description',
    'edit',
    'chart',
    'select',
  ];
  sub = new Subscription();
  dataSource!: any;
  buttonsDisabled = true;
  filterValue = '';
  isRotating = false;
  private openedWindows: Window[] = [];
  collectionName = AlertsCollection.WorkingAlerts;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  searchKeywordFilter = new FormControl();
  tooltipPosition: TooltipPosition = 'above';

  selection = new SelectionModel<any>(true, []);
  constructor(
    private alertsService: VwapAlertsGenericService,
    private modelDialog: MatDialog,
    public coinLinksService: CoinLinksService,
    private router: Router
  ) {}

  ngOnInit() {
    window.scrollTo(0, 0);
    this.refreshDataTable();
    this.sub.add(
      this.alertsService
        .alerts$(AlertsCollection.WorkingAlerts)
        .subscribe((data) => {
          this.dataSource = new MatTableDataSource(data);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        })
    );
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
  // Check if all rows are selected
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length; // Use dataSource.data.length
    return numSelected === numRows;
  }

  onGoToChart(item: VwapAlert) {
    console.log('VwapAlert TBL ---> ', item);
    const urlTree = this.router.createUrlTree([LIGHTWEIGHT_CHART], {
      queryParams: {
        symbol: item.symbol,
        category: item.category,
        imageUrl: item.imageUrl,
        tvLink: this.coinLinksService.tradingViewLink(
          item.symbol,
          item.exchanges || []
        ),
      },
    });
    const url = this.router.serializeUrl(urlTree);
    window.open(url, '_blank');
  }

  onOpenDescriptionModalDialog(alert: Alert): void {
    this.modelDialog.open(DescriptionModalComponent, {
      data: alert,
      enterAnimationDuration: 250,
      exitAnimationDuration: 250,
      width: '100vw',
      height: '100vh',
    });
  }

  onDeleteSelected() {
    const alerts = this.selection.selected as Alert[];
    const ids = alerts.map((a) => a.id);
    this.alertsService.deleteMany(AlertsCollection.WorkingAlerts, ids);
    this.selection.clear();
    this.buttonsDisabled = true;
  }

  onEdit(alert: VwapAlert) {
    console.log('VwapAlert TBL ---> ', alert);
    if (alert) {
      this.modelDialog.open(EditVwapAlertComponent, {
        data: { collectionName: this.collectionName, alert: alert },
        enterAnimationDuration: 250,
        exitAnimationDuration: 250,
        width: '95vw',
        height: '100vh',
      });
    }
  }

  onMoveToArchive() {
    const alerts = this.selection.selected as Alert[];
    const ids = alerts.map((a) => a.id);
    this.alertsService.moveMany(
      AlertsCollection.WorkingAlerts,
      AlertsCollection.ArchivedAlerts,
      ids
    );
    this.selection.clear();
    this.buttonsDisabled = true;
  }

  clearInput() {
    this.filterValue = '';
    this.dataSource.filter = this.filterValue.trim().toLowerCase();
  }

  refreshDataTable() {
    this.isRotating = true;
    this.alertsService
      .getAllAlerts(AlertsCollection.WorkingAlerts)
      .subscribe((data) => {
        console.log('Vwap Working Alerts data', data);
      });
    setTimeout(() => {
      this.isRotating = false;
    }, 1000);
  }

  onOpenCoinglass(): void {
    this.openCoinGlassWindowsFromSelection();
  }

  onOpenTradingview(): void {
    this.openTvWindowsFromSelection();
  }

  private openTvWindowsFromSelection(): void {
    this.selection.selected.forEach((v: Coin, index: number) => {
      setTimeout(() => {
        const newWindow = window.open(
          this.coinLinksService.tradingViewLink(v.symbol, v.exchanges),
          '_blank'
        );
        if (newWindow) this.openedWindows.push(newWindow);
      }, index * 1500);
    });
    this.selection.clear();
  }

  onGoToCharts(): void {
    this.openVwapChartsFromSelection();
  }

  private openVwapChartsFromSelection(): void {
    this.selection.selected.forEach((v: Coin, index: number) => {
      setTimeout(() => {
        const urlTree = this.router.createUrlTree([LIGHTWEIGHT_CHART], {
          queryParams: {
            symbol: v.symbol,
            category: v.category,
            imageUrl: v.imageUrl,
          },
        });
        const url = this.router.serializeUrl(urlTree);
        const newWindow = window.open(url, '_blank');
        if (newWindow) {
          this.openedWindows.push(newWindow);
        }
      }, index * 1500); // Delay between openings
    });
    this.selection.clear();
  }

  private openCoinGlassWindowsFromSelection(): void {
    this.selection.selected.forEach((v: Coin, index: number) => {
      setTimeout(() => {
        const newWindow = window.open(
          this.coinLinksService.coinglassLink(v.symbol, v.exchanges),
          '_blank'
        );
        if (newWindow) this.openedWindows.push(newWindow);
      }, index * 1500);
    });
    this.selection.clear();
  }

  onCloseAllWindows(): void {
    this.openedWindows.forEach((win) => win.close());
    this.openedWindows = [];
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
