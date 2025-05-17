import { SelectionModel } from '@angular/cdk/collections';

import { Component, OnDestroy, OnInit } from '@angular/core';

import { Subscription } from 'rxjs';
import { Coin } from 'src/app/models/coin/coin';
import { WorkingCoinsService } from 'src/service/coins/working-coins.service';

@Component({
  selector: 'app-work-field',
  templateUrl: './work-field.component.html',
  styleUrls: ['./work-field.component.css', '../../../styles-alerts.css'],
})
export class WorkFieldComponent implements OnInit, OnDestroy {
  subscription: Subscription = new Subscription();
  coinsAtWork!: Coin[];
  selection = new SelectionModel<any>(true, []);
  constructor(private workingCoinsService: WorkingCoinsService) {}
  ngOnInit(): void {
    window.scrollTo(0, 0);
    // ✅ Subscribe to Working Coins
    this.subscription.add(
      this.workingCoinsService.coins$.subscribe((coins) => {
        this.coinsAtWork = coins;
        console.log('WorkingCoins --->', coins);
      })
    );
  }

  isAllSelected() {
    return true;
  }

  // Selection Methods
  toggleAll(): void {
    this.selection.isSelected(this.coinsAtWork)
      ? this.selection.clear()
      : this.selection.select(this.coinsAtWork);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
