import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Alert } from 'src/app/models/alerts/alert';
import { AlertsCollection } from 'src/app/models/alerts/alerts-collections';
import { Subscription } from 'rxjs';
import { EditAlertComponent } from 'src/app/edit-alert/edit-alert.component';
import { AlertsGenericService } from 'src/service/alerts/alerts-generic.service';
import { DialogService } from 'src/service/general/dialog.service';
import { SwiperViewerComponent } from 'src/app/swiper-viewer/swiper-viewer.component';
import { CoinLinksService } from 'src/service/coin-links.service';

@Component({
  selector: 'app-archived-table',
  templateUrl: './archived-table.component.html',
  styleUrls: [
    './archived-table.component.css',
    './../../../styles-alerts.css',
    './../../../styles-plain-tables.css',
  ],
})
export class ArchivedTableComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = [
    'symbol',
    'alertName',
    'action',
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
    private alertsService: AlertsGenericService,
    private matDialog: MatDialog,
    private dialogService: DialogService,
    public coinLinksService: CoinLinksService
  ) {}

  ngOnInit() {
    window.scrollTo(0, 0);
    this.alertsService.getAllAlerts(AlertsCollection.ArchivedAlerts);
    this.sub = this.alertsService
      .alerts$(AlertsCollection.ArchivedAlerts)
      .subscribe((data) => {
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

  onOpenDescriptionModalDialog(alert: Alert): void {
    if (!alert) {
      console.error('No alert selected. Cannot open modal.');
      return;
    }
    this.dialogService.openFullScreenDialog(SwiperViewerComponent, alert);
  }

  onDeleteSelected() {
    const alerts = this.selection.selected as Alert[];
    const ids = alerts.map((a) => a.id);
    this.alertsService.deleteMany(AlertsCollection.ArchivedAlerts, ids);
    this.deleteDisabled = true;
    this.selection.clear();
  }

  onEdit(alert: Alert) {
    this.matDialog.open(EditAlertComponent, {
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
