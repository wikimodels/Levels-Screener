import { Component, Input } from '@angular/core';
import { ChartsOpenerService } from 'src/service/general/charts-opener.service';

@Component({
  selector: 'app-charts-buttons-panel',
  templateUrl: './charts-buttons-panel.component.html',
  styleUrls: ['./charts-buttons-panel.component.css'],
})
export class ChartsButtonsPanelComponent {
  @Input() selection: any;
  constructor(private chartsOpenerService: ChartsOpenerService) {}

  // =========== CHARTS  =================
  onOpenCoinglass(): void {
    this.chartsOpenerService.openCoinGlassCharts(this.selection.selected);
    this.selection.clear();
  }

  onOpenDefaultTradingView(): void {
    this.chartsOpenerService.openDefaultTradingView();
    this.selection.clear();
  }

  onOpenTradingview(): void {
    this.chartsOpenerService.openTradingViewCharts(this.selection.selected);
    this.selection.clear();
  }

  onOpenSingleTradingview(): void {
    this.chartsOpenerService.openDefaultTradingView();
    this.selection.clear();
  }

  onGoToVwapCharts(): void {
    this.chartsOpenerService.openVwapCharts(this.selection.selected);
    this.selection.clear();
  }

  onGoToLineCharts(): void {
    this.chartsOpenerService.openLineCharts(this.selection.selected);
    this.selection.clear();
  }

  onCloseAllWindows(): void {
    this.chartsOpenerService.closeAllWindows();
  }
}
