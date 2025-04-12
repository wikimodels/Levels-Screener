import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { UTCTimestamp, MouseEventParams, LineStyle } from 'lightweight-charts';

import { ActivatedRoute, Router } from '@angular/router';
import { LineTwChartService } from 'src/service/kline/line-tw-chart.service';
import { roundToMatchDecimals } from 'src/functions/round-to-match-decimals';
import { BaseChartDrawingService } from 'src/service/kline/base-chart-drawing.service';
import { VWAP_LIGHTWEIGHT_CHART } from 'src/consts/url-consts';

@Component({
  selector: 'app-vwap-lightweight-chart',
  templateUrl: './line-lightweight-chart.component.html',
  styleUrls: [
    './line-lightweight-chart.component.css',
    './../../styles-alerts.css',
  ],
})
export class LineLightweightChartComponent implements OnInit, OnDestroy {
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;

  symbol!: string;
  imageUrl!: string;
  category!: string;
  tvLink!: string;

  constructor(
    private route: ActivatedRoute,
    private lineKlineService: LineTwChartService,
    public baseCharDrawingService: BaseChartDrawingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    window.scrollTo(0, 0);

    const params = this.route.snapshot.queryParams;
    this.symbol = params['symbol'];
    this.imageUrl = params['imageUrl'];
    this.category = params['category'];
    this.tvLink = params['tvLink'];

    this.baseCharDrawingService.initChart(this.chartContainer);
    this.baseCharDrawingService.loadChartData(this.symbol); // Replace
    this.setupClickHandler();
    this.setupHoverHandler();
  }

  // Track current highlight

  private setupHoverHandler(): void {
    const tolerance = 0.1; // Define the tolerance range (adjust as needed)

    this.baseCharDrawingService.chart.subscribeCrosshairMove((param) => {
      // Case 1: Mouse leaves chart area
      if (!param.point?.y) {
        if (this.baseCharDrawingService.highlightedPrice !== undefined) {
          this.baseCharDrawingService.horizontalLines
            .get(this.baseCharDrawingService.highlightedPrice)
            ?.line.applyOptions({
              color: this.baseCharDrawingService.globalLineColor, // Revert to original style
              lineWidth: 2,
              lineStyle: LineStyle.Solid,
            });
          this.baseCharDrawingService.highlightedPrice = undefined;
        }
        return;
      }

      // Get current price at mouse position
      const rawPrice =
        this.baseCharDrawingService.candlestickSeries.coordinateToPrice(
          param.point.y
        );
      const price = roundToMatchDecimals(
        this.baseCharDrawingService.klineData[0].closePrice,
        Number(rawPrice)
      );

      if (price === null) return;

      // Check if the price is within tolerance of any line
      let closestPrice: number | undefined = undefined;
      for (const [linePrice] of this.baseCharDrawingService.horizontalLines) {
        if (Math.abs(linePrice - price) <= tolerance) {
          closestPrice = linePrice;
          break;
        }
      }

      // Case 2: No matching line within tolerance
      if (closestPrice === undefined) {
        if (this.baseCharDrawingService.highlightedPrice !== undefined) {
          this.baseCharDrawingService.horizontalLines
            .get(this.baseCharDrawingService.highlightedPrice)
            ?.line.applyOptions({
              color: this.baseCharDrawingService.globalLineColor,
              lineWidth: 2,
              lineStyle: LineStyle.Solid,
            });
          this.baseCharDrawingService.highlightedPrice = undefined;
        }
        return;
      }

      // Case 3: Price matches a line within tolerance
      if (this.baseCharDrawingService.highlightedPrice !== closestPrice) {
        // Revert previous highlight
        if (this.baseCharDrawingService.highlightedPrice !== undefined) {
          this.baseCharDrawingService.horizontalLines
            .get(this.baseCharDrawingService.highlightedPrice)
            ?.line.applyOptions({
              color: this.baseCharDrawingService.globalLineColor,
              lineWidth: 2,
              lineStyle: LineStyle.Solid,
            });
        }

        // Apply new highlight
        this.baseCharDrawingService.horizontalLines
          .get(closestPrice)
          ?.line.applyOptions({
            color: '#FF0000', // Highlight color
            lineWidth: 3, // Thicker line
            lineStyle: LineStyle.Solid, // More visible style
          });
        this.baseCharDrawingService.highlightedPrice = closestPrice;
      }
    });
  }

  refreshChartData() {
    this.baseCharDrawingService.loadChartData(this.symbol);
  }

  private setupClickHandler(): void {
    this.baseCharDrawingService.chart.subscribeClick(
      (params: MouseEventParams) => {
        if (!params.point?.y) return; // Ignore clicks without valid coordinates

        // Get price at the clicked Y coordinate
        const rawPrice =
          this.baseCharDrawingService.candlestickSeries.coordinateToPrice(
            params.point.y
          );
        const price = roundToMatchDecimals(
          this.baseCharDrawingService.klineData[0].closePrice,
          Number(rawPrice)
        );

        if (price === null) return; // Handle invalid prices

        const tolerance = 0.1; // Define the tolerance range (adjust as needed)

        // Check if a line is highlighted and matches the clicked price
        if (
          this.baseCharDrawingService.highlightedPrice !== undefined &&
          Math.abs(this.baseCharDrawingService.highlightedPrice - price) <=
            tolerance
        ) {
          // Remove the highlighted line
          const closestPrice = this.baseCharDrawingService.highlightedPrice;
          const entry =
            this.baseCharDrawingService.horizontalLines.get(closestPrice);
          if (entry) {
            entry.series.removePriceLine(entry.line); // Remove the line from the chart
            this.baseCharDrawingService.horizontalLines.delete(closestPrice); // Remove it from the Map
            this.lineKlineService.deleteAlertBySymbolAndPrice(
              this.symbol,
              closestPrice
            ); // Delete from backend
          }
          this.baseCharDrawingService.highlightedPrice = undefined; // Reset highlight
        } else {
          // Add a new price line if no line is detected under the click
          let lineExists = false;
          for (const [linePrice] of this.baseCharDrawingService
            .horizontalLines) {
            if (Math.abs(linePrice - price) <= tolerance) {
              lineExists = true;
              break;
            }
          }

          if (!lineExists) {
            // Add a new price line at the clicked price
            const time = this.baseCharDrawingService.klineData[0]
              .closePrice as UTCTimestamp;
            this.addPriceLine(time, price);
          }
        }
      }
    );
  }

  private addPriceLine(time: UTCTimestamp, price: number) {
    console.log('time:', time, 'price:', price);

    // Store in Map with time as key
    const priceLine =
      this.baseCharDrawingService.candlestickSeries.createPriceLine({
        price,
        color: this.baseCharDrawingService.globalLineColor,
        lineWidth: 2,
        lineStyle: LineStyle.Solid,
        axisLabelVisible: false,
      });

    this.baseCharDrawingService.horizontalLines.set(price, {
      line: priceLine,
      series: this.baseCharDrawingService.candlestickSeries,
      data: [{ time, value: price }],
    });
    console.log('horizLines', this.baseCharDrawingService.horizontalLines);
    this.lineKlineService.addAlertBySymbolAndPrice(this.symbol, price);
  }

  // private removePriceLine(price: number) {
  //   const priceLine = this.horizontalLines.get(price);
  //   if (priceLine) {
  //     this.alertSeries.removePriceLine(priceLine);
  //     this.horizontalLines.delete(price);
  //     this.lineKlineService.deleteAlertBySymbolAndPrice(this.symbol, price);
  //   }
  // }

  goToVwapChart() {
    const urlTree = this.router.createUrlTree([VWAP_LIGHTWEIGHT_CHART], {
      queryParams: {
        symbol: this.symbol,
        category: this.category,
        imageUrl: this.imageUrl,
      },
    });
    const url = this.router.serializeUrl(urlTree);
    window.open(url, '_blank');
  }

  ngOnDestroy(): void {
    this.baseCharDrawingService.destroyChart();
  }
}
