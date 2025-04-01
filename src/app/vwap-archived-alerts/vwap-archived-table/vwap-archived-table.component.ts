import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { AlertsCollection } from 'models/alerts/alerts-collections';
import { VwapAlert } from 'models/vwap/vwap-alert';
import { Subscription } from 'rxjs';
import { DescriptionModalComponent } from 'src/app/shared/description-modal/description-modal.component';

import { EditVwapAlertComponent } from 'src/app/shared/edit-vwap-alert/edit-vwap-alert.component';
import { KLINE_CHART } from 'src/consts/url-consts';

import { CoinLinksService } from 'src/service/coin-links.service';
import { VwapAlertsGenericService } from 'src/service/vwap-alerts/vwap-alerts-generic.service';

@Component({
  selector: 'app-vwap-archived-table',
  templateUrl: './vwap-archived-table.component.html',
  styleUrls: [
    './vwap-archived-table.component.css',
    './../../../styles-alerts.css',
    './../../../styles-vwap-tables.css',
  ],
})
export class VwapArchivedTableComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = [
    'symbol',
    'anchorTimeStr',
    'links',
    'description',
    'edit',
    'select',
  ];
  sub!: Subscription | null;
  dataSource!: any;
  deleteDisabled = true;
  filterValue = '';
  isRotating = false;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  searchKeywordFilter = new FormControl();

  selection = new SelectionModel<any>(true, []);
  constructor(
    private alertsService: VwapAlertsGenericService,
    private matDialog: MatDialog,
    private router: Router,
    public coinLinksService: CoinLinksService
  ) {}

  ngOnInit() {
    this.alertsService.getAllAlerts(AlertsCollection.ArchivedAlerts);
    this.sub = this.alertsService
      .alerts$(AlertsCollection.ArchivedAlerts)
      .subscribe((data) => {
        console.log('ARCHIVED shit', data);
        this.dataSource = new MatTableDataSource(data);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      });
  }

  // Filter function
  applyFilter(event: KeyboardEvent) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  onDataToggled(data: any) {
    this.selection.toggle(data);
    this.deleteDisabled = this.selection.selected.length > 0 ? false : true;
  }

  // Toggle "Select All" checkbox
  toggleAll() {
    if (this.isAllSelected()) {
      this.selection.clear();
      this.deleteDisabled = true;
    } else {
      this.selection.select(...this.dataSource.data);
      this.deleteDisabled = false;
    }
  }
  // Check if all rows are selected
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length; // Use dataSource.data.length
    return numSelected === numRows;
  }

  onOpenDescriptionModalDialog(alert: VwapAlert): void {
    this.matDialog.open(DescriptionModalComponent, {
      data: alert,
      enterAnimationDuration: 250,
      exitAnimationDuration: 250,
      width: '100vw',
      height: '100vh',
    });
  }

  onDeleteSelected() {
    const alerts = this.selection.selected as VwapAlert[];
    const ids = alerts.map((a) => a.id);
    this.alertsService.deleteMany(AlertsCollection.ArchivedAlerts, ids);
    this.deleteDisabled = true;
    this.selection.clear();
  }

  onEdit(alert: VwapAlert) {
    this.matDialog.open(EditVwapAlertComponent, {
      data: { collectionName: AlertsCollection.ArchivedAlerts, alert: alert },
      enterAnimationDuration: 250,
      exitAnimationDuration: 250,
      width: '95vw',
      height: '100vh',
    });
  }

  clearInput() {
    this.filterValue = '';
    this.dataSource.filter = this.filterValue.trim().toLowerCase();
  }

  onGoToChart(item: VwapAlert) {
    const urlTree = this.router.createUrlTree([KLINE_CHART], {
      queryParams: { symbol: item.symbol },
    });
    const url = this.router.serializeUrl(urlTree);
    window.open(url, '_blank');
  }

  refreshDataTable() {
    this.alertsService.getAllAlerts(AlertsCollection.ArchivedAlerts);
    this.isRotating = true;
    setTimeout(() => {
      this.isRotating = false;
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
