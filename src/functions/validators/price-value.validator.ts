import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function priceValueValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const priceRegex = /^-?\d*(\.\d+)?$/;
    const isValid = priceRegex.test(control.value);
    return isValid ? null : { priceInvalid: true };
  };
}
