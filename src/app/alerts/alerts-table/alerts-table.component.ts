import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { NewAlertComponent } from '../new-alert/new-alert.component';
import { SelectionModel } from '@angular/cdk/collections';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DescriptionModalComponent } from 'src/app/shared/description-modal/description-modal.component';
import { TooltipPosition } from '@angular/material/tooltip';
import { AlertsGenericService } from 'src/service/alerts/alerts-generic.service';
import { AlertsCollection } from 'models/alerts/alerts-collections';
import { Alert } from 'models/alerts/alert';
import { EditAlertComponent } from 'src/app/shared/edit-alert/edit-alert.component';
import { Subscription } from 'rxjs';
import { CoinLinksService } from 'src/service/coin-links.service';
import { Coin } from 'models/coin/coin';
import { LIGHTWEIGHT_CHART } from 'src/consts/url-consts';
import { Route, Router } from '@angular/router';

@Component({
  selector: 'app-alerts-table',
  templateUrl: './alerts-table.component.html',
  styleUrls: [
    './alerts-table.component.css',
    './../../../styles-alerts.css',
    './../../../styles-plain-tables.css',
  ],
})
export class AlertsTableComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = [
    'symbol',
    'alertName',
    'action',
    'price',
    'links',
    'isActive',
    'description',
    'edit',
    'select',
  ];
  sub = new Subscription();
  private openedWindows: Window[] = [];
  dataSource!: any;
  buttonsDisabled = true;
  filterValue = '';
  isRotating = false;
  collectionName = AlertsCollection.WorkingAlerts;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  searchKeywordFilter = new FormControl();
  tooltipPosition: TooltipPosition = 'above';

  selection = new SelectionModel<any>(true, []);
  constructor(
    private alertsService: AlertsGenericService,
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

  onAddAlert() {
    this.modelDialog.open(NewAlertComponent, {
      enterAnimationDuration: 250,
      exitAnimationDuration: 250,
      width: '100vw',
      height: '100vh',
    });
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

  onEdit(alert: Alert) {
    console.log('ALERTS TBL ---> ', alert);
    if (alert) {
      this.modelDialog.open(EditAlertComponent, {
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
    this.alertsService.getAllAlerts(AlertsCollection.WorkingAlerts);
    setTimeout(() => {
      this.isRotating = false;
    }, 1000);
  }

  onCloseAllWindows(): void {
    this.openedWindows.forEach((win) => win.close());
    this.openedWindows = [];
  }

  private openWindowsFromSelection(): void {
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

  onOpenTradingview(): void {
    this.openWindowsFromSelection();
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
  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
