import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Coin } from 'src/app/models/coin/coin';

import { Subscription } from 'rxjs';

import { CoinsGenericService } from 'src/service/coins/coins-generic.service';

import { WorkSelectionService } from 'src/service/work.selection.service';
import { ChartsOpenerService } from 'src/service/general/charts-opener.service';

@Component({
  selector: 'app-coins',
  templateUrl: './coins.component.html',
  styleUrls: ['./coins.component.css', './../../styles-alerts.css'],
})
export class CoinsComponent {
  // Properties
  count = 0;
  coins: Coin[] = [];
  coinsAtWork: Coin[] = [];
  symbols: string[] = [];
  form!: FormGroup;
  filteredSymbols: string[] = [];
  private subscription = new Subscription();
  private sortState: 'romanAsc' | 'romanDesc' | 'alphaAsc' | 'alphaDesc' =
    'alphaAsc';

  // Constructor
  constructor(
    private coinsService: CoinsGenericService,
    private chartsOpenerService: ChartsOpenerService,
    private fb: FormBuilder,
    public selectionService: WorkSelectionService<any>
  ) {}

  // Lifecycle Hooks
  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.initializeData();
    this.subscribeToWorkingCoins();
    this.initializeForm();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  // Initialization Methods
  private initializeData(): void {
    this.subscription.add(
      this.coinsService.loadCoins().subscribe((coins) => {
        this.coins = coins.sort((a, b) => a.symbol.localeCompare(b.symbol));
        console.log('Coins fethed: ', this.coins.length);

        this.symbols = this.coins.map((d) => d.symbol);
        this.selectionService.clear();
      })
    );
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      symbol: [''],
    });

    this.form.get('symbol')?.valueChanges.subscribe((inputValue: string) => {
      const value = inputValue?.toUpperCase() || '';
      this.coins = this.coinsService
        .getCoins()
        .sort((a, b) => a.symbol.localeCompare(b.symbol))
        .filter((coin) => coin.symbol.toUpperCase().includes(value));
    });
  }

  private subscribeToWorkingCoins(): void {
    this.subscription.add();
  }

  filterSymbols(): void {
    const inputValue = this.form?.get('symbol')?.value?.toUpperCase() || '';
    this.coins = this.coins.filter((coin) =>
      coin.symbol.toUpperCase().includes(inputValue)
    );
  }

  clearInput(): void {
    this.filteredSymbols = [];
    this.form?.reset();
  }

  toggleAll(): void {
    this.selectionService.isAllSelected(this.coins)
      ? this.selectionService.clear()
      : this.selectionService.select(this.coins);
  }

  isAllSelected(): boolean {
    return this.selectionService.isAllSelected(this.coins);
  }

  // =========== CHARTS  =================
  onOpenCoinglass(): void {
    this.chartsOpenerService.openCoinGlassCharts(
      this.selectionService.selectedValues()
    );
    this.selectionService.clear();
  }

  onOpenTradingview(): void {
    this.chartsOpenerService.openTradingViewCharts(
      this.selectionService.selectedValues()
    );
    this.selectionService.clear();
  }

  onOpenDefaultTradingView(): void {
    this.chartsOpenerService.openDefaultTradingView();
  }

  onGoToVwapCharts(): void {
    this.chartsOpenerService.openVwapCharts(
      this.selectionService.selectedValues()
    );
    this.selectionService.clear();
  }

  onGoToLineCharts(): void {
    this.chartsOpenerService.openLineCharts(
      this.selectionService.selectedValues()
    );
    this.selectionService.clear();
  }

  onCloseAllWindows(): void {
    this.chartsOpenerService.closeAllWindows();
  }

  // ======= COIN SORTING ===============

  toggleSort(): void {
    switch (this.sortState) {
      case 'romanAsc':
        this.sortRomanNumerals('desc');
        this.sortState = 'romanDesc';
        break;
      case 'romanDesc':
        this.sortAlphabetically('asc');
        this.sortState = 'alphaAsc';
        break;
      case 'alphaAsc':
        this.sortAlphabetically('desc');
        this.sortState = 'alphaDesc';
        break;
      case 'alphaDesc':
        this.sortRomanNumerals('asc');
        this.sortState = 'romanAsc';
        break;
    }
    console.log(`Sorted Coins (${this.sortState}):`, this.coins);
  }

  /**
   * Sorts the coins array by Roman numeral order.
   * @param order - 'asc' for ascending, 'desc' for descending
   */
  private sortRomanNumerals(order: 'asc' | 'desc'): void {
    const romanOrder = ['I', 'II', 'III', 'IV', 'V', 'VI']; // Define the Roman numeral order
    this.coins.sort((a, b) => {
      const indexA = romanOrder.indexOf(a.category);
      const indexB = romanOrder.indexOf(b.category);
      return order === 'asc' ? indexA - indexB : indexB - indexA;
    });
  }

  private sortAlphabetically(order: 'asc' | 'desc'): void {
    this.coins.sort((a, b) => {
      const comparison = a.category.localeCompare(b.category);
      return order === 'asc' ? comparison : -comparison;
    });
  }
}
