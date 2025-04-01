import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChartRefreshService {
  private refreshChartSubject = new Subject<void>();

  // Observable for components to subscribe
  refreshChart$ = this.refreshChartSubject.asObservable();

  // Method to trigger a chart refresh
  triggerRefresh(): void {
    this.refreshChartSubject.next();
  }
}
