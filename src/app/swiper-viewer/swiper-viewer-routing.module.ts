import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SwiperViewerComponent } from './swiper-viewer.component';

export const routes: Routes = [{ path: '', component: SwiperViewerComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SwiperViewerRoutingModule {}
