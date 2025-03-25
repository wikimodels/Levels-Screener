import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Coin } from 'models/coin/coin';
import { SnackbarType } from 'models/shared/snackbar-type';
import { Subscription } from 'rxjs';
import { KLINE_CHART } from 'src/consts/url-consts';
import { CoinLinksService } from 'src/service/coin-links.service';
import { CoinsGenericService } from 'src/service/coins/coins-generic.service';
import { WorkingCoinsService } from 'src/service/coins/working-coins.service';
import { SnackbarService } from 'src/service/snackbar.service';
import { WorkSelectionService } from 'src/service/work.selection.service';

@Component({
  selector: 'app-coins',
  templateUrl: './coins.component.html',
  styleUrls: ['./coins.component.css'],
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
  defaultLink = 'https://www.tradingview.com/chart?symbol=BINANCE:BTCUSDT.P';
  private openedWindows: Window[] = [];

  // Constructor
  constructor(
    private coinsService: CoinsGenericService,

    private coinsLinksService: CoinLinksService,
    private fb: FormBuilder,
    private router: Router,
    public selectionService: WorkSelectionService<any>
  ) {}

  // Lifecycle Hooks
  ngOnInit(): void {
    this.initializeData();
    this.subscribeToWorkingCoins();
    this.initializeForm();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  // Initialization Methods
  private initializeData(): void {
    this.coins = this.coinsService
      .getCoins()
      .sort((a, b) => a.symbol.localeCompare(b.symbol));

    this.symbols = this.coins.map((d) => d.symbol);

    this.selectionService.clear();
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

  // Coin Management Methods

  // Selection Methods
  toggleAll(): void {
    this.selectionService.isAllSelected(this.coins)
      ? this.selectionService.clear()
      : this.selectionService.select(this.coins);
  }

  isAllSelected(): boolean {
    return this.selectionService.isAllSelected(this.coins);
  }

  // Window Management Methods
  onOpenCoinglass(): void {
    this.openWindowsFromSelection();
  }

  onOpenTradingview(): void {
    this.openWindowsFromSelection();
  }

  onOpenSingleTradingview(): void {
    const newWindow = window.open(this.defaultLink, '_blank');
    if (newWindow) this.openedWindows.push(newWindow);
  }

  private openWindowsFromSelection(): void {
    this.selectionService.selectedValues().forEach((v: Coin, index: number) => {
      setTimeout(() => {
        const urlTree = this.router.createUrlTree([KLINE_CHART], {
          queryParams: { symbol: v.symbol },
        });
        const url = this.router.serializeUrl(urlTree);
        const newWindow = window.open(url, '_blank');
        if (newWindow) {
          this.openedWindows.push(newWindow);
        }
      }, index * 1500); // Delay between openings
    });
  }

  onCloseAllWindows(): void {
    this.openedWindows.forEach((win) => win.close());
    this.openedWindows = [];
  }

  onGoToCharts(): void {
    this.openWindowsFromSelection();
  }
}
