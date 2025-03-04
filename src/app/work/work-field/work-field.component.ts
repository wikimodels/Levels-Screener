import { SelectionModel } from '@angular/cdk/collections';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Coin } from 'models/coin/coin';
import { CoinsCollections } from 'models/coin/coins-collections';
import { Subscription } from 'rxjs';
import { CoinsGenericService } from 'src/service/coins/coins-generic.service';
import { WorkingCoinsService } from 'src/service/coins/working-coins.service';

@Component({
  selector: 'app-work-field',
  templateUrl: './work-field.component.html',
  styleUrls: ['./work-field.component.css'],
})
export class WorkFieldComponent implements OnInit, OnDestroy {
  subscription: Subscription = new Subscription();
  coinsAtWork!: Coin[];
  selection = new SelectionModel<any>(true, []);
  constructor(private workingCoinsService: WorkingCoinsService) {}
  ngOnInit(): void {
    // ✅ Subscribe to Working Coins
    this.subscription.add(
      this.workingCoinsService.coins$.subscribe((coins) => {
        this.coinsAtWork = coins;
      })
    );
  }

  isAllSelected() {
    return true;
  }

  toggleAll() {}

  onDrop(event: CdkDragDrop<any[]>): void {
    //moveItemInArray(this.coins, event.previousIndex, event.currentIndex);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
