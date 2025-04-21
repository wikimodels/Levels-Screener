// snackbar.service.ts
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarType } from 'src/app/models/shared/snackbar-type';

@Injectable({
  providedIn: 'root', // This makes the service available throughout the app
})
export class SnackbarService {
  constructor(private snackBar: MatSnackBar) {}

  // Generic method to show snackbar with dynamic message and action
  showSnackBar(
    message: string,
    action: string = '',
    duration: number = 2000,
    snackbarType: SnackbarType = SnackbarType.Info
  ) {
    // SNACKBAR CSS CLASSES
    // - .warning-snackbar
    // - .info-snackbar
    // - .error-snackbar

    this.snackBar.open(message, action, {
      duration: duration,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: [snackbarType],
    });
  }
}
