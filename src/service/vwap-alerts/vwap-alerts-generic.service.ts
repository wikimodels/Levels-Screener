import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { SnackbarService } from '../snackbar.service';
import { InsertResult, MoveResult } from 'models/mongodb/operations';
import { SnackbarType } from 'models/shared/snackbar-type';
import { VwapAlert } from 'models/vwap/vwap-alert';
import { VWAP_ALERTS_URLS } from 'src/consts/url-consts';
import { createHttpParams } from 'src/functions/create-params';

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

  public getAllAlerts(collectionName: string): Observable<VwapAlert[]> {
    // HTTP request to add a VwapAlert with query parameters
    const params = createHttpParams({ collectionName });
    const options = { ...this.httpOptions, params };
    return this.http
      .get<VwapAlert[]>(VWAP_ALERTS_URLS.vwapAlertsUrl, options)
      .pipe(
        // Sort alerts by activationTime in descending order
        map((data) => {
          return data.sort((a, b) => {
            if (a.activationTime === undefined) return 1; // Place undefined values last
            if (b.activationTime === undefined) return -1; // Place undefined values last
            return Number(b.activationTime) - Number(a.activationTime); // Descending order
          });
        }),
        tap((sortedAlerts) => {
          this.setAlerts(collectionName, []);
          this.setAlerts(collectionName, sortedAlerts);
          console.log(
            `Brought from server --> CollectionName: ${collectionName}`,
            sortedAlerts
          );
        }),
        catchError((error) => {
          this.handleError(error); // Centralized error handling
          return throwError(
            () => new Error(`Failed to fetch alerts: ${error.message}`)
          );
        })
      );
  }

  public addOne(collectionName: string, alert: VwapAlert): void {
    const currentAlerts = this.getAlerts(collectionName);
    this.setAlerts(collectionName, [...currentAlerts, alert]);

    // HTTP request to add a VwapAlert with query parameters
    const params = createHttpParams({ collectionName });
    const options = { ...this.httpOptions, params };
    console.log('VwapAlert to add --> ', alert);
    this.http
      .post<InsertResult>(
        `${VWAP_ALERTS_URLS.vwapAlertsAddOneUrl}`,
        { alert },
        options
      )
      .subscribe({
        next: (response: InsertResult) => {
          console.log(
            'vwap-alerts-generic.service Add response --> ',
            response
          );
          const msg = `VWAP Alert successfully added`;
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
    const params = createHttpParams({ collectionName });

    const options = {
      ...this.httpOptions,
      params: params,
      body: { ids },
    };
    console.log(options);
    this.http
      .delete<boolean>(`${VWAP_ALERTS_URLS.vwapAlertsDeleteManyUrl}`, options)
      .subscribe({
        next: (response: boolean) => {
          console.log(
            'vwap-alerts-generic.serviceDelete response --> ',
            response
          );
          const msg = `VWAP Alert successfully deleted`;
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
    const params = createHttpParams({ collectionName });
    const options = { ...this.httpOptions, params };

    // 🔹 Send update request to the server
    this.http
      .put<boolean>(
        `${VWAP_ALERTS_URLS.vwapAlertsUpdateOneUrl}`,
        { filter, updatedData },
        options
      )
      .subscribe({
        next: (response: boolean) => {
          if (response) {
            this.snackbarService.showSnackBar(`✅ Update successful`, '');
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
    const params = createHttpParams({
      sourceCollection,
      targetCollection,
    });
    const options = { ...this.httpOptions, params };

    this.http
      .post<MoveResult>(
        `${VWAP_ALERTS_URLS.vwapAlertsMoveManyUrl}`,
        { ids },
        options
      )
      .subscribe({
        next: (response: MoveResult) => {
          console.log(
            'vwap-alerts-generic.service Move response --> ',
            response
          );
          const msg = `VWAP Alerts successfully moved`;
          this.snackbarService.showSnackBar(msg, '');
        },
        error: (error) => this.handleError(error),
      });
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
