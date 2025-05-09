import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { SelectionModel } from '@angular/cdk/collections';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TooltipPosition } from '@angular/material/tooltip';
import { AlertsCollection } from 'src/app/models/alerts/alerts-collections';
import { Alert } from 'src/app/models/alerts/alert';
import { Subscription } from 'rxjs';
import { CoinLinksService } from 'src/service/coin-links.service';
import { VwapAlertsGenericService } from 'src/service/vwap-alerts/vwap-alerts-generic.service';
import { VwapAlert } from 'src/app/models/vwap/vwap-alert';
import { Router } from '@angular/router';
import { VWAP_LIGHTWEIGHT_CHART } from 'src/consts/url-consts';
import { EditVwapAlertComponent } from 'src/app/edit-vwap-alert/edit-vwap-alert.component';
import { DialogService } from 'src/service/general/dialog.service';
import { SwiperViewerComponent } from 'src/app/swiper-viewer/swiper-viewer.component';

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
    // 'chart',
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
    private router: Router,
    private dialogService: DialogService
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
  onOpenDescriptionModalDialog(alert: Alert): void {
    if (!alert) {
      console.error('No alert selected. Cannot open modal.');
      return;
    }
    this.dialogService.openFullScreenDialog(SwiperViewerComponent, alert);
  }

  onGoToChart(item: VwapAlert) {
    console.log('VwapAlert TBL ---> ', item);
    const urlTree = this.router.createUrlTree([VWAP_LIGHTWEIGHT_CHART], {
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

  onToggleActiveStatus(alert: VwapAlert) {
    const updatedIsActive = !alert.isActive;

    this.alertsService.updateOne(
      this.collectionName,
      { id: alert.id }, // filter
      { isActive: updatedIsActive } // updated fields
    );

    // Optionally update UI immediately (optimistic update)
    alert.isActive = updatedIsActive;
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

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
