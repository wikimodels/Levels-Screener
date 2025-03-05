import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Coin } from 'models/coin/coin';
import { SnackbarType } from 'models/shared/snackbar-type';
import { Subscription } from 'rxjs';
import { CoinLinksService } from 'src/service/coin-links.service';
import { CoinsGenericService } from 'src/service/coins/coins-generic.service';
import { WorkingCoinsService } from 'src/service/coins/working-coins.service';
import { SnackbarService } from 'src/service/snackbar.service';
import { WorkSelectionService } from 'src/service/work.selection.service';

@Component({
  selector: 'app-work',
  templateUrl: './work.component.html',
  styleUrls: ['./work.component.css'],
})
export class WorkComponent implements OnInit, OnDestroy {
  count = 0;
  coins: Coin[] = [];
  coinsAtWork: Coin[] = [];
  symbols: string[] = [];
  form!: FormGroup;
  filteredSymbols: string[] = [];
  private subscription = new Subscription();
  defaultLink = 'https://www.tradingview.com/chart?symbol=BINANCE:BTCUSDT.P';
  private openedWindows: Window[] = [];

  constructor(
    private coinsService: CoinsGenericService,
    private workingCoinsService: WorkingCoinsService,
    private coinsLinksService: CoinLinksService,
    private fb: FormBuilder,
    private snackbarService: SnackbarService,
    public selectionService: WorkSelectionService<any>
  ) {}

  ngOnInit(): void {
    this.coins = this.coinsService.getCoins();
    this.symbols = this.coins.map((d) => d.symbol);

    // ✅ Subscribe to Working Coins
    this.subscription.add(
      this.workingCoinsService.coins$.subscribe((coins) => {
        console.log('WorkingCoins --->', coins);
        this.coinsAtWork = coins;
        this.count = coins.length;
      })
    );

    // ✅ Fetch working coins once
    this.workingCoinsService.getAllWorkingCoins();

    this.selectionService.clear();
    this.form = this.fb.group({
      symbol: [''],
    });
  }

  filterSymbols(): void {
    const inputValue = this.form?.get('symbol')?.value?.toLowerCase() || '';
    this.filteredSymbols = this.symbols.filter((symbol) =>
      symbol.toLowerCase().includes(inputValue)
    );
  }

  onPutToWork(): void {
    if (this.form?.valid) {
      const symbol = this.form.get('symbol')?.value;
      const coin = this.coins.find((c) => c.symbol === symbol);

      if (coin) {
        const alreadyAdded = this.coinsAtWork.some(
          (c) => c.symbol === coin.symbol
        );
        if (alreadyAdded) {
          this.snackbarService.showSnackBar(
            'Coin already in List',
            '',
            3000,
            SnackbarType.Warning
          );
        } else {
          // Remove from local state
          this.coinsAtWork.push(coin);
          this.coinsAtWork.sort((a, b) => a.symbol.localeCompare(b.symbol));
          this.workingCoinsService.updateWorkingCoin(coin);
        }
      }
    }
    this.form?.reset();
  }

  clearInput(): void {
    this.filteredSymbols = [];
    this.form?.reset();
  }

  toggleAll(): void {
    this.selectionService.isAllSelected(this.coinsAtWork)
      ? this.selectionService.clear()
      : this.selectionService.select(this.coinsAtWork);
  }

  isAllSelected(): boolean {
    return this.selectionService.isAllSelected(this.coinsAtWork);
  }

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
        const newWindow = window.open(
          this.coinsLinksService.tradingViewLink(v.symbol, v.exchanges),
          '_blank'
        );
        if (newWindow) this.openedWindows.push(newWindow);
      }, index * 1500);
    });
  }

  onCloseAllWindows(): void {
    this.openedWindows.forEach((win) => win.close());
    this.openedWindows = [];
  }

  onRemoveFromWork(): void {
    const coinsToRemove = this.selectionService.selectedValues() as Coin[];
    const symbolsToRemove = coinsToRemove.map((c) => c.symbol);

    // Remove from local state
    this.coinsAtWork = this.coinsAtWork.filter(
      (coin) => !symbolsToRemove.includes(coin.symbol)
    );

    // Remove from backend
    this.workingCoinsService.deleteWorkingCoins(symbolsToRemove);

    // Remove from selection
    this.selectionService.clear();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
