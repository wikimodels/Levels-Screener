import { Component, Input } from '@angular/core';
import { ChartsOpenerService } from 'src/service/general/charts-opener.service';

@Component({
  selector: 'app-charts-buttons-panel',
  templateUrl: './charts-buttons-panel.component.html',
  styleUrls: ['./charts-buttons-panel.component.css'],
})
export class ChartsButtonsPanelComponent {
  @Input() selected: any;
  constructor(private chartsOpenerService: ChartsOpenerService) {}

  // =========== CHARTS  =================
  onOpenCoinglass(): void {
    this.chartsOpenerService.openCoinGlassCharts(this.selected);
  }

  onOpenDefaultTradingView(): void {
    this.chartsOpenerService.openDefaultTradingView();
  }

  onOpenTradingview(): void {
    this.chartsOpenerService.openTradingViewCharts(this.selected);
  }

  onOpenSingleTradingview(): void {
    this.chartsOpenerService.openDefaultTradingView();
  }

  onGoToVwapCharts(): void {
    this.chartsOpenerService.openVwapCharts(this.selected);
  }

  onGoToLineCharts(): void {
    this.chartsOpenerService.openLineCharts(this.selected);
  }

  onCloseAllWindows(): void {
    this.chartsOpenerService.closeAllWindows();
  }
}
