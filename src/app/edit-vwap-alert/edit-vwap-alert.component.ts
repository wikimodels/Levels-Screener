import { Component, Inject, NgZone, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { take } from 'rxjs';

import { VwapAlertsGenericService } from 'src/service/vwap-alerts/vwap-alerts-generic.service';
import { VwapAlert } from 'src/app/models/vwap/vwap-alert';

@Component({
  selector: 'app-vwap-edit-alert',
  templateUrl: './edit-vwap-alert.component.html',
  styleUrls: ['./edit-vwap-alert.component.css'],
})
export class EditVwapAlertComponent {
  logoUrl = 'assets/img/noname.png';
  displayedSymbol!: string;

  constructor(
    private fb: FormBuilder,
    private alertService: VwapAlertsGenericService,
    public dialogRef: MatDialogRef<EditVwapAlertComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { collectionName: string; alert: VwapAlert },
    private _ngZone: NgZone
  ) {}

  form!: FormGroup | null;

  filteredSymbols!: string[] | null;
  validationMessages: { [key: string]: string[] } = {};
  @ViewChild('autosize') autosize!: CdkTextareaAutosize;

  ngOnInit(): void {
    this.logoUrl = this.data.alert?.imageUrl
      ? this.data.alert?.imageUrl
      : this.logoUrl;
    this.displayedSymbol = this.data.alert.symbol + ' VWAP ALERT EDIT';
    this.form = this.fb.group({
      symbol: [{ value: '', disabled: true }],
      isActive: [this.data.alert.isActive],
      anchorTimeStr: [{ value: '', disabled: true }],
      description: ['', Validators.required],
      imageLinks: this.fb.array([]),
    });
    this.populateForm();
  }

  populateForm() {
    console.log('EDIT-ALERT TBL ---> ', this.data.alert);

    this.imageLinks.clear();
    this.form?.setValue({
      symbol: this.data.alert.symbol,
      anchorTimeStr: this.data.alert.anchorTimeStr,
      isActive: this.data.alert.isActive,
      description: this.data.alert.description || 'Nothing to say yet',
      imageLinks: [], // Add the Available form control
    });
    // Populate the FormArray for imageLinks
    this.data.alert.tvScreensUrls?.forEach((url: string) => {
      this.imageLinks.push(this.fb.control(url)); // Add each URL as a FormControl
    });
  }

  triggerResize() {
    // Wait for changes to be applied, then trigger textarea resize.
    this._ngZone.onStable
      .pipe(take(1))
      .subscribe(() => this.autosize.resizeToFitContent(true));
  }

  // Create a FormControl with URL validator
  createImageLinkControl() {
    return this.fb.control('', [
      Validators.required,
      Validators.pattern(
        /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/
      ), // URL pattern
    ]);
  }

  get imageLinks() {
    return this.form?.get('imageLinks') as FormArray;
  }

  addLink() {
    this.imageLinks.push(this.createImageLinkControl());
  }

  removeLink(index: number) {
    if (this.imageLinks.length > 1) {
      this.imageLinks.removeAt(index);
    }
  }

  onSubmit() {
    this.form?.markAllAsTouched();
    this.imageLinks.controls.forEach((c) => {
      c.markAllAsTouched();
    });
    this.form?.markAsDirty();
    this.form?.updateValueAndValidity();
    if (this.form?.valid) {
      this.data.alert.description = this.form.get('description')?.value;
      this.data.alert.tvScreensUrls = this.imageLinks.value;
      this.data.alert.isActive = this.form.get('isActive')?.value;

      this.alertService.updateOne(
        this.data.collectionName,
        { id: this.data.alert.id },
        {
          isActive: this.data.alert.isActive,
          description: this.data.alert.description,
          tvScreensUrls: this.data.alert.tvScreensUrls,
        }
      );

      this.dialogRef.close();
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}
