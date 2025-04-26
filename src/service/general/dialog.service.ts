import { Injectable } from '@angular/core';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import { ComponentType } from '@angular/cdk/portal';

@Injectable({ providedIn: 'root' })
export class DialogService {
  constructor(private dialog: MatDialog) {}

  /**
   * Opens a full‐screen modal for the given component, passing in `data`.
   * @param component  The component to render inside the dialog
   * @param data       Data object to inject via MAT_DIALOG_DATA
   * @param configExt  (optional) Partial MatDialogConfig to override defaults
   */
  openFullScreenDialog<T, D = any, R = any>(
    component: ComponentType<T>,
    data: D,
    configExt: Partial<MatDialogConfig<D>> = {}
  ): MatDialogRef<T, R> {
    const baseConfig: MatDialogConfig<D> = {
      data,
      enterAnimationDuration: '250ms',
      exitAnimationDuration: '250ms',
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      maxHeight: '100vh',
      panelClass: 'full-screen-dialog',
    };
    const config: MatDialogConfig<D> = { ...baseConfig, ...configExt };
    return this.dialog.open(component, config);
  }
}
