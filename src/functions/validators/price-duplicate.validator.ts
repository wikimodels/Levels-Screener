import {
  AsyncValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { AlertsCollection } from 'src/app/models/alerts/alerts-collections';
import { Observable, of } from 'rxjs';
import { AlertsGenericService } from 'src/service/alerts/alerts-generic.service';

export class PriceDuplicateValidator {
  static createValidator(
    alertsService: AlertsGenericService,
    symbolControlName: string // Accept symbol control name
  ): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      // Retrieve the symbol control from the parent form group
      const symbolControl = control.parent?.get(symbolControlName);
      const symbolValue = symbolControl?.value;
      const priceValue = control.value;

      // If symbol or price is missing, return no error
      if (symbolValue == null || priceValue == null) {
        return of(null);
      }

      // Convert price to a number (handle possible string input)
      const price = Number(priceValue);
      if (isNaN(price)) {
        return of(null); // Let other validators handle invalid numbers
      }

      // Check existing alerts for matching symbol and price
      const alerts = alertsService.getAlerts(AlertsCollection.WorkingAlerts);
      const exists = alerts.some(
        (alert) => alert.symbol === symbolValue && alert.price === price
      );

      return exists ? of({ priceExists: true }) : of(null);
    };
  }
}
