import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { SnackbarService } from '../snackbar.service';
import {
  DeleteResult,
  InsertResult,
  ModifyResult,
  MoveResult,
} from 'models/mongodb/operations';
import { SnackbarType } from 'models/shared/snackbar-type';

import { ALERTS_URLS, VWAP_ALERTS_URLS } from 'src/consts/url-consts';
import { VwapAlert } from 'models/vwap/vwap-alert';

@Injectable({ providedIn: 'root' })
export class VwapAlertsGenericService {
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }),
  };

  constructor(
    private http: HttpClient,
    private snackbarService: SnackbarService
  ) {}

  private AlertCollections: Map<string, BehaviorSubject<VwapAlert[]>> =
    new Map();

  private getOrCreateCollection(
    collectionName: string
  ): BehaviorSubject<VwapAlert[]> {
    if (!this.AlertCollections.has(collectionName)) {
      this.AlertCollections.set(
        collectionName,
        new BehaviorSubject<VwapAlert[]>([])
      );
    }
    return this.AlertCollections.get(collectionName)!;
  }

  public alerts$(collectionName: string): Observable<VwapAlert[]> {
    return this.getOrCreateCollection(collectionName).asObservable();
  }

  public setAlerts(collectionName: string, Alerts: VwapAlert[]): void {
    const alertCollection = this.getOrCreateCollection(collectionName);
    alertCollection.next(Alerts);
  }

  public getAlerts(collectionName: string): VwapAlert[] {
    return this.getOrCreateCollection(collectionName).value;
  }

  public getAllAlerts(collectionName: string): void {
    // HTTP request to add a VwapAlert with query parameters
    const params = this.createHttpParams({ collectionName });
    const options = { ...this.httpOptions, params };

    this.http
      .get<VwapAlert[]>(VWAP_ALERTS_URLS.vwapAlertsUrl, options)
      .subscribe({
        next: (alerts: VwapAlert[]) => {
          console.log('Fresh VWPA Alerts --> ', alerts);
          // 🔹 Clear the local store before updating with new alerts
          this.setAlerts(collectionName, []);
          this.setAlerts(collectionName, alerts);
        },
        error: (error) => this.handleError(error),
      });
  }

  public addOne(collectionName: string, alert: VwapAlert): void {
    const currentAlerts = this.getAlerts(collectionName);
    this.setAlerts(collectionName, [...currentAlerts, alert]);

    // HTTP request to add a VwapAlert with query parameters
    const params = this.createHttpParams({ collectionName });
    const options = { ...this.httpOptions, params };
    console.log('VwapAlert to add --> ', alert);
    this.http
      .post<InsertResult>(`${ALERTS_URLS.alertsAddOneUrl}`, { alert }, options)
      .subscribe({
        next: (response: InsertResult) => {
          const msg = `Document inserted ${response.insertedCount}`;
          this.snackbarService.showSnackBar(msg, '');
        },
        error: (error) => this.handleError(error),
      });
  }

  public deleteMany(collectionName: string, ids: string[]): void {
    const currentAlerts = this.getAlerts(collectionName);
    const remainingAlerts = currentAlerts.filter(
      (alert) => !ids.includes(alert.id)
    );
    this.setAlerts(collectionName, remainingAlerts);
    const params = this.createHttpParams({ collectionName });

    const options = {
      ...this.httpOptions,
      params: params,
      body: { ids },
    };
    console.log(options);
    this.http
      .delete<DeleteResult>(
        `${VWAP_ALERTS_URLS.vwapAlertsDeleteManyUrl}`,
        options
      )
      .subscribe({
        next: (response: DeleteResult) => {
          const msg = `Documents deleted ${response.deletedCount}`;
          this.snackbarService.showSnackBar(msg, '');
        },
        error: (error) => this.handleError(error),
      });
  }

  public updateOne(
    collectionName: string,
    filter: Partial<VwapAlert>,
    updatedData: Partial<VwapAlert>
  ): void {
    // 🔹 Get current alerts
    const currentAlerts = this.getAlerts(collectionName);

    // 🔹 Update alerts only if the filter matches
    const updatedAlerts = currentAlerts.map((VwapAlert) =>
      VwapAlert.id === filter.id ? { ...VwapAlert, ...updatedData } : VwapAlert
    );

    // 🔹 Update local state
    this.setAlerts(collectionName, updatedAlerts);

    // 🔹 Prepare HTTP request
    const params = this.createHttpParams({ collectionName });
    const options = { ...this.httpOptions, params };

    // 🔹 Send update request to the server
    this.http
      .put<ModifyResult>(
        `${ALERTS_URLS.alertsUpdateOneUrl}`,
        { filter, updatedData },
        options
      )
      .subscribe({
        next: (response: ModifyResult) => {
          if (response.modifiedCount > 0) {
            this.snackbarService.showSnackBar(
              `✅ Updated ${response.modifiedCount} document(s).`,
              ''
            );
          } else {
            this.snackbarService.showSnackBar(
              `⚠️ No matching documents found.`,
              ''
            );
          }
        },
        error: (error) => {
          console.error('❌ Update failed:', error);
          this.snackbarService.showSnackBar(
            '❌ Error updating VwapAlert!',
            'Close'
          );
        },
      });
  }

  public moveMany(
    sourceCollection: string,
    targetCollection: string,
    ids: string[]
  ): void {
    const sourceAlerts = this.getAlerts(sourceCollection);
    const destinationAlerts = this.getAlerts(targetCollection);

    // ✅ Filter alerts to move based on provided IDs
    const alertsToMove = sourceAlerts.filter((VwapAlert) =>
      ids.includes(VwapAlert.id)
    );
    const remainingSourceAlerts = sourceAlerts.filter(
      (VwapAlert) => !ids.includes(VwapAlert.id)
    );

    // ✅ Update source and destination collections locally
    this.setAlerts(sourceCollection, remainingSourceAlerts);
    this.setAlerts(targetCollection, [...destinationAlerts, ...alertsToMove]);

    // ✅ HTTP request to move alerts
    const params = this.createHttpParams({
      sourceCollection,
      targetCollection,
    });
    const options = { ...this.httpOptions, params };

    this.http
      .post<MoveResult>(`${ALERTS_URLS.alertsMoveManyUrl}`, { ids }, options)
      .subscribe({
        next: (response: MoveResult) => {
          const msg = `Documents inserted: ${response.insertCount}, deleted: ${response.deleteCount}`;
          this.snackbarService.showSnackBar(msg, '');
        },
        error: (error) => this.handleError(error),
      });
  }

  private createHttpParams(params?: { [key: string]: any }): HttpParams {
    let httpParams = new HttpParams();
    if (params) {
      for (const key of Object.keys(params)) {
        httpParams = httpParams.set(key, params[key]);
      }
    }
    return httpParams;
  }

  //---------------------------------------------
  // ✅ ERROR HANDLING
  //---------------------------------------------
  private handleError(error: Error): Observable<never> {
    console.error('An error occurred:', error);
    const msg = 'ERROR: ' + error.message;
    this.snackbarService.showSnackBar(msg, '', 8000, SnackbarType.Error);
    return throwError(() => new Error('Something went wrong! ', error));
  }
}
