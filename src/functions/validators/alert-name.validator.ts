import {
  AsyncValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { AlertsCollection } from 'models/alerts/alerts-collections';
import { Observable, of } from 'rxjs';
import { AlertsGenericService } from 'src/service/alerts/alerts-generic.service';

export class AlertNameValidator {
  static createValidator(
    alertsService: AlertsGenericService
  ): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      //alertsService.getAllAlerts(AlertsCollection.WorkingAlerts);
      const alerts = alertsService.getAlerts(AlertsCollection.WorkingAlerts);
      const result = alerts.find((a) => a.alertName == control.value);
      const hasError = result ? { alertNameTaken: true } : null;
      return of(hasError);
    };
  }
}
