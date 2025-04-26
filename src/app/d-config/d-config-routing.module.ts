import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DConfigComponent } from './d-config.component';

export const routes: Routes = [{ path: '', component: DConfigComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DConfigRoutingModule {}
