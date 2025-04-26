import { Component, Inject, OnInit } from '@angular/core';
// your.component.ts
import SwiperCore, { Pagination, Zoom } from 'swiper';
import { VwapAlert } from '../models/vwap/vwap-alert';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Alert } from '../models/alerts/alert';
import { DescriptionModalComponent } from '../shared/description-modal/description-modal.component';

// Register Swiper modules
SwiperCore.use([Pagination, Zoom]);
@Component({
  selector: 'app-description',
  templateUrl: './swiper-viewer.component.html',
  styleUrls: ['./swiper-viewer.component.css'],
})
export class SwiperViewerComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public alert: Alert | VwapAlert,
    public dialogRef: MatDialogRef<DescriptionModalComponent>
  ) {}

  imageUrls: string[] = [];
  defaultImageUrl = 'assets/img/no-chart-image.jpg';
  isZoomOpen = false;
  selectedIndex = 0;
  touchStartX = 0;
  currentSlide = 0;
  carouselWidth = window.innerWidth;

  ngOnInit(): void {
    window.scrollTo(0, 0);
    console.log('DATA ---> ', this.alert);

    if (this.alert.tvScreensUrls && this.alert.tvScreensUrls?.length !== 0) {
      this.imageUrls = [...this.alert.tvScreensUrls];
    } else {
      this.alert.tvScreensUrls = ['assets/img/no-chart-image.jpg'];
    }
  }

  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.touches[0].clientX;
  }

  onTouchMove(event: TouchEvent): void {
    const deltaX = event.touches[0].clientX - this.touchStartX;
    const carousel = document.getElementById('carousel') as HTMLElement;
    if (carousel) {
      carousel.style.transition = 'none';
      carousel.style.transform = `translateX(${
        -this.currentSlide * this.carouselWidth + deltaX
      }px)`;
    }
  }

  onTouchEnd(event: TouchEvent): void {
    const deltaX = event.changedTouches[0].clientX - this.touchStartX;
    const threshold = this.carouselWidth / 4;

    if (deltaX > threshold && this.currentSlide > 0) {
      this.currentSlide--;
    } else if (
      deltaX < -threshold &&
      this.alert.tvScreensUrls &&
      this.currentSlide < this.alert.tvScreensUrls.length - 1
    ) {
      this.currentSlide++;
    }

    const carousel = document.getElementById('carousel') as HTMLElement;
    if (carousel) {
      carousel.style.transition = 'transform 0.3s ease';
      carousel.style.transform = `translateX(-${
        this.currentSlide * this.carouselWidth
      }px)`;
    }
  }

  openZoom(index: number) {
    this.selectedIndex = index;
    this.isZoomOpen = true;
  }

  onGoBack() {
    window.history.back();
  }
}
