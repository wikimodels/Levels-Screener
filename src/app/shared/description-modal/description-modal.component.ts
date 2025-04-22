import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  trigger,
  style,
  animate,
  transition,
  state,
} from '@angular/animations';
import { Alert } from 'src/app/models/alerts/alert';

@Component({
  selector: 'app-description-modal',
  templateUrl: './description-modal.component.html',
  styleUrls: ['./description-modal.component.css'],
  animations: [
    trigger('fadeIn', [
      // Define a hidden state with opacity 0
      state(
        'hidden',
        style({
          opacity: 0,
        })
      ),
      // Define a visible state with opacity 1
      state(
        'visible',
        style({
          opacity: 1,
        })
      ),
      // Define a transition from hidden to visible with an animation duration of 1s
      transition('hidden => visible', [animate('1s ease-in')]),
    ]),
  ],
})
export class DescriptionModalComponent implements OnInit {
  imageUrls: string[] = [];
  defaultImageUrl = 'assets/img/no-chart-image.jpg';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Alert,
    public dialogRef: MatDialogRef<DescriptionModalComponent>
  ) {}

  ngOnInit(): void {
    if (this.data.tvScreensUrls && this.data.tvScreensUrls?.length !== 0) {
      this.imageUrls = [...this.data.tvScreensUrls];
    } else {
      this.imageUrls.push(this.defaultImageUrl);
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
