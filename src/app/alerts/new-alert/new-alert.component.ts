import { Component, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertNameValidator } from 'src/functions/validators/alert-name.validator';
import { MatDialogRef } from '@angular/material/dialog';
import { SymbolNameValidator } from 'src/functions/validators/symbol-name.validator';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { Subscription, take } from 'rxjs';
import { CoinsGenericService } from 'src/service/coins/coins-generic.service';
import { v4 as uuidv4 } from 'uuid';

import { AlertsGenericService } from 'src/service/alerts/alerts-generic.service';
import { AlertsCollection } from 'models/alerts/alerts-collections';
import { Coin } from 'models/coin/coin';

@Component({
  selector: 'app-new-alert',
  templateUrl: './new-alert.component.html',
  styleUrls: ['./new-alert.component.css'],
  providers: [],
})
export class NewAlertComponent implements OnInit, OnDestroy {
  validationMessages: { [key: string]: string[] } = {};
  filteredSymbols!: string[];
  sub!: Subscription;
  symbols!: string[];
  exchanges!: string[][];
  form!: FormGroup;
  coins!: Coin[];
  logoUrl = 'assets/img/noname.png';
  displayedSymol = 'New Alert';

  @ViewChild('autosize') autosize!: CdkTextareaAutosize;

  ngOnInit(): void {
    this.coins = this.coinsService.getCoins();
    this.symbols = this.coins.map((c) => c.symbol);
    this.exchanges = this.coins.map((c) => c.exchanges);

    this.form = this.fb.group({
      symbol: [
        '',
        Validators.compose([Validators.required]),
        Validators.composeAsync([
          SymbolNameValidator.createValidator(this.coinsService),
        ]),
      ],
      alertName: [
        '',
        Validators.compose([Validators.required]),
        Validators.composeAsync([
          AlertNameValidator.createValidator(this.alertsService),
        ]),
      ],
      price: [
        '',
        Validators.compose([
          Validators.required,
          Validators.pattern('^-?\\d*(\\.\\d+)?$'),
        ]),
      ],
      isActive: [true],
      action: ['', Validators.required],
      description: ['', Validators.required],
      tvScreensUrls: this.fb.array([this.createImageUrlControl()]),
    });

    this.form.get('symbol')?.valueChanges.subscribe((value: string) => {
      const coins = this.coins.find((c) => c.symbol == value);
      this.logoUrl = coins?.imageUrl ? coins?.imageUrl : this.logoUrl;
      this.displayedSymol = coins?.symbol
        ? coins?.symbol + ' ALERT'
        : this.displayedSymol;
    });
  }

  constructor(
    private fb: FormBuilder,
    private coinsService: CoinsGenericService,
    public dialogRef: MatDialogRef<NewAlertComponent>,
    private alertsService: AlertsGenericService,
    private _ngZone: NgZone
  ) {}

  triggerResize() {
    // Wait for changes to be applied, then trigger textarea resize.
    this._ngZone.onStable
      .pipe(take(1))
      .subscribe(() => this.autosize.resizeToFitContent(true));
  }

  // Create a FormControl with URL validator
  createImageUrlControl() {
    return this.fb.control('', [
      Validators.required,
      Validators.pattern(
        /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/
      ), // URL pattern
    ]);
  }

  preventEKey(event: KeyboardEvent): void {
    if (event.key === 'e' || event.key === 'E') {
      event.preventDefault(); // Prevent default behavior of the 'e' key
    }
  }
  // Method to filter the symbol list based on user input
  filterSymbols(): void {
    let inputValue = '';
    if (this.form) {
      inputValue = this.form.get('symbol')?.value.toLowerCase() || '';
    }
    if (this.symbols) {
      this.filteredSymbols = this.symbols.filter((symbol) =>
        symbol.toLowerCase().includes(inputValue)
      );
    }
  }

  get imgUrls() {
    return this.form?.get('tvScreensUrls') as FormArray;
  }

  addLink() {
    this.imgUrls.push(this.createImageUrlControl());
  }

  removeLink(index: number) {
    if (this.imgUrls.length > 1) {
      this.imgUrls.removeAt(index);
    }
  }

  onSubmit() {
    this.form?.markAllAsTouched();
    this.form?.markAsDirty();
    this.form?.updateValueAndValidity();
    this.imgUrls.controls.forEach((c) => {
      c.markAllAsTouched();
      c.markAsDirty();
      c.updateValueAndValidity();
    });

    if (this.form?.valid) {
      const alert = this.form.value;
      const coin = this.coins.find((c) => c.symbol == alert.symbol);
      alert.id = uuidv4();
      alert.description = this.form.get('description')?.value;
      alert.tvScreensUrls = this.form.get('tvScreensUrls')?.value;
      alert.alertName = this.form.get('alertName')?.value;
      alert.action = this.form.get('action')?.value;
      alert.price = this.form.get('price')?.value;
      alert.isActive = this.form.get('isActive')?.value;
      alert.imageUrl = coin?.imageUrl || this.logoUrl;
      alert.isActive = true;
      alert.exchanges = coin?.exchanges;
      alert.category = coin?.category;

      alert.creationTime = new Date().getTime();
      console.log('Alert ---> ', alert);
      console.log('COIN ---> ', coin);
      this.alertsService.addOne(AlertsCollection.WorkingAlerts, alert);
      this.dialogRef.close();
    }
  }

  cancel() {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
