import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-zoom-viewer',
  templateUrl: './zoom-viewer.component.html',
  styleUrls: ['./zoom-viewer.component.css'],
})
export class ZoomViewerComponent {
  @Input() images: string[] = [];
  @Input() initialIndex = 0;
  @Input() isOpen = false;
  @Output() closed = new EventEmitter<void>();

  close() {
    this.closed.emit();
  }
}
