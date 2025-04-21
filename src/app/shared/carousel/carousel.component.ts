// carousel.component.ts
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css'],
})
export class CarouselComponent {
  @Input() images: string[] = [];
  currentSlide = 0;
  controlsVisible = false;

  prevSlide(): void {
    this.currentSlide =
      this.currentSlide > 0 ? this.currentSlide - 1 : this.images.length - 1;
  }

  nextSlide(): void {
    this.currentSlide =
      this.currentSlide < this.images.length - 1 ? this.currentSlide + 1 : 0;
  }
}
