import { Component, Input } from '@angular/core';
import { EChartsOption } from 'echarts';
import { EChartsType } from 'echarts/core';
import { KlineData } from 'models/kline/kline-data';
import { AnchoredVwapService } from 'src/service/vwap/anchor-vwap.service';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css'],
})
export class ChartComponent {
  @Input() chartOptions: EChartsOption = {};
  @Input() symbol = '';
  private chart: EChartsType | null = null;
  private vwapLines: { [key: number]: any } = {}; // Store VWAP lines by openTime
  @Input() klineData: KlineData[] | undefined;

  constructor(private vwapService: AnchoredVwapService) {}

  onChartInit(chartInstance: EChartsType): void {
    this.chart = chartInstance;
    console.log('Chart initialized:', this.chart);

    this.chart.on('click', (params: any) => {
      if (params && params.data) {
        const openTime = params.data[0]; // Assuming first value is open time
        this.toggleVwapLine(openTime);
      }
    });
  }

  toggleVwapLine(openTime: number): void {
    if (this.vwapLines[openTime]) {
      this.removeVwap(openTime);
    } else {
      this.addVwap(openTime);
    }
  }

  addVwap(openTime: number): void {
    console.log(`Fetching VWAP for openTime: ${openTime}`);

    // Ensure klineData is available and valid
    if (!this.klineData || this.klineData.length === 0) {
      console.error('Kline data is empty or not available!');
      return;
    }

    // Now we try to identify the correct index for the timestamp
    const startIndex = this.klineData.findIndex((kline: any) => {
      return kline.openTime === openTime; // Correct comparison for openTime
    });

    if (startIndex === -1) {
      console.error('No kline data found for the given openTime:', openTime);
      return;
    }

    const relevantKlines = this.klineData.slice(startIndex);

    // Calculate VWAP: sum of price * volume / sum of volume
    let cumulativeVolume = 0;
    let cumulativeVWAP = 0;
    const vwapData: [number, number][] = []; // [time, vwap]

    relevantKlines.forEach((kline: any) => {
      const {
        openTime,
        openPrice,
        closePrice,
        lowPrice,
        highPrice,
        baseVolume,
      } = kline;
      const typicalPrice = (highPrice + lowPrice + closePrice) / 3; // Average price
      cumulativeVolume += baseVolume;
      cumulativeVWAP += typicalPrice * baseVolume;

      const vwap = cumulativeVWAP / cumulativeVolume; // VWAP calculation
      vwapData.push([openTime, vwap]);
    });

    // Ensure VWAP data is not empty
    if (vwapData.length === 0) {
      console.error('VWAP data is empty!');
      return;
    }

    // Create the VWAP series
    const vwapSeries = {
      name: `VWAP-${openTime}`,
      type: 'line',
      data: vwapData,
      smooth: true,
      lineStyle: { color: 'orange', width: 2 },
      showSymbol: false,
    };

    // Add the VWAP series to the chart and store it
    this.vwapLines[openTime] = vwapSeries;

    // Check if chart is not null before calling setOption
    if (this.chart) {
      // Update the chart options while preserving existing series
      const currentOption = this.chart.getOption() as { series?: any[] };
      this.chart.setOption({
        series: [...(currentOption.series || []), vwapSeries], // Append VWAP line
      });
      this.vwapService.saveAnchorPoint(this.symbol, openTime).subscribe(() => {
        console.log('VWAP series added to chart');
      });
    } else {
      console.error('Chart is not initialized!');
    }
  }

  removeVwap(openTime: number): void {
    this.vwapService
      .saveAnchorPoint(this.symbol, openTime)
      .subscribe((remainingData) => {
        if (remainingData.length === 0) {
          console.log('No VWAP data found to delete.');
        } else {
          // If there is remaining data, rerender the chart
          console.log('VWAP data deleted successfully.');
          this.vwapLines = {}; // Clear the current VWAP lines
          this.redrawChart(remainingData); // Redraw with remaining VWAP data
        }
      });
  }

  redrawChart(remainingData: any[]): void {
    if (!this.chart) return;

    const series: any[] = [];
    remainingData.forEach((data) => {
      const { anchorTime, timestamp } = data;
      const relevantKlines = this.klineData?.filter(
        (kline: any) => kline.openTime >= anchorTime
      );
      if (relevantKlines) {
        let cumulativeVolume = 0;
        let cumulativeVWAP = 0;
        const vwapData: [number, number][] = [];

        relevantKlines.forEach((kline: any) => {
          const {
            openTime,
            openPrice,
            closePrice,
            lowPrice,
            highPrice,
            baseVolume,
          } = kline;
          const typicalPrice = (highPrice + lowPrice + closePrice) / 3;
          cumulativeVolume += baseVolume;
          cumulativeVWAP += typicalPrice * baseVolume;
          const vwap = cumulativeVWAP / cumulativeVolume;
          vwapData.push([openTime, vwap]);
        });

        const vwapSeries = {
          name: `VWAP-${anchorTime}`,
          type: 'line',
          data: vwapData,
          smooth: true,
          lineStyle: { color: 'orange', width: 2 },
          showSymbol: false,
        };
        series.push(vwapSeries);
      }
    });

    this.chart.setOption({
      series: series, // Redraw chart with remaining VWAP lines
    });
  }
}
