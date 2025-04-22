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
import { getAlertName } from 'src/functions/get-alert-name';

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

  async ngOnInit(): Promise<void> {
    window.scrollTo(0, 0);

    const params = this.route.snapshot.queryParams;
    this.symbol = params['symbol'];
    this.imageUrl = params['imageUrl'];
    this.category = params['category'];
    this.tvLink = params['tvLink'];
    console.log(this.symbol, this.imageUrl, this.category, this.tvLink);

    https: this.baseCharDrawingService.initChart(this.chartContainer);
    await this.baseCharDrawingService.loadChartData(this.symbol);

    this.setupClickHandler();
    this.setupHoverHandler();
  }

  // Track current highlight

  private setupHoverHandler(): void {
    this.baseCharDrawingService.chart.subscribeCrosshairMove((param) => {
      // Case 1: Mouse leaves chart area
      if (!param.point?.y) {
        if (this.baseCharDrawingService.highlightedPrice !== undefined) {
          this.baseCharDrawingService.horizontalLines
            .get(this.baseCharDrawingService.highlightedPrice)
            ?.line.applyOptions({
              color: this.baseCharDrawingService.globalLineColor,
              lineWidth: 2,
              lineStyle: LineStyle.Dotted,
            });
          this.baseCharDrawingService.highlightedPrice = undefined;
        }
        return;
      }

      // Get RAW price and round to match chart's decimal precision
      const rawPrice =
        this.baseCharDrawingService.candlestickSeries.coordinateToPrice(
          param.point.y
        ) || 0;
      const price = roundToMatchDecimals(
        this.baseCharDrawingService.klineData[0].closePrice,
        rawPrice
      );

      // Find closest line within tolerance
      let closestPrice: number | undefined = undefined;
      for (const [linePrice] of this.baseCharDrawingService.horizontalLines) {
        // Calculate the ratio between linePrice and price
        const ratio = linePrice > price ? linePrice / price : price / linePrice;

        // Check if the ratio is within the tolerance (e.g., 10%)
        if (ratio <= this.baseCharDrawingService.getTolerance()) {
          closestPrice = linePrice;
          break;
        }
      }

      // Case 2: No line within tolerance
      if (closestPrice === undefined) {
        if (this.baseCharDrawingService.highlightedPrice !== undefined) {
          this.baseCharDrawingService.horizontalLines
            .get(this.baseCharDrawingService.highlightedPrice)
            ?.line.applyOptions({
              color: this.baseCharDrawingService.globalLineColor,
              lineWidth: 2,
              lineStyle: LineStyle.Dotted,
            });
          this.baseCharDrawingService.highlightedPrice = undefined;
        }
        return;
      }

      // Case 3: Line found within tolerance
      if (this.baseCharDrawingService.highlightedPrice !== closestPrice) {
        // Revert previous highlight
        if (this.baseCharDrawingService.highlightedPrice !== undefined) {
          this.baseCharDrawingService.horizontalLines
            .get(this.baseCharDrawingService.highlightedPrice)
            ?.line.applyOptions({
              color: this.baseCharDrawingService.globalLineColor,
              lineWidth: 2,
              lineStyle: LineStyle.Dotted,
            });
        }

        // Apply new highlight
        this.baseCharDrawingService.horizontalLines
          .get(closestPrice) // ← Use closestPrice (not price)
          ?.line.applyOptions({
            color: '#FF0000',
            lineWidth: 3,
            lineStyle: LineStyle.Solid,
          });
        this.baseCharDrawingService.highlightedPrice = closestPrice; // ← Use closestPrice
      }
    });
  }

  private setupClickHandler(): void {
    this.baseCharDrawingService.chart.subscribeClick(
      (params: MouseEventParams) => {
        if (!params.point?.y) return; // Ignore invalid clicks

        // Get price at clicked Y coordinate
        const rawPrice =
          this.baseCharDrawingService.candlestickSeries.coordinateToPrice(
            params.point.y
          );
        const price = roundToMatchDecimals(
          this.baseCharDrawingService.klineData[0].closePrice,
          Number(rawPrice)
        );

        if (price === null) return; // Handle invalid prices

        // Check if a highlighted line is clicked (using ratio tolerance)
        if (this.baseCharDrawingService.highlightedPrice !== undefined) {
          const highlightedPrice = this.baseCharDrawingService.highlightedPrice;
          const ratio =
            highlightedPrice > price
              ? highlightedPrice / price
              : price / highlightedPrice;

          if (ratio <= this.baseCharDrawingService.getTolerance()) {
            // Remove the highlighted line
            const entry =
              this.baseCharDrawingService.horizontalLines.get(highlightedPrice);
            if (entry) {
              entry.series.removePriceLine(entry.line);
              this.baseCharDrawingService.horizontalLines.delete(
                highlightedPrice
              );
              this.lineKlineService.deleteAlertBySymbolAndPrice(
                this.symbol,
                highlightedPrice
              );
            }
            this.baseCharDrawingService.highlightedPrice = undefined;
            return; // Exit early after removal
          }
        }

        // Check if a line already exists within ratio tolerance
        let lineExists = false;
        for (const [linePrice] of this.baseCharDrawingService.horizontalLines) {
          const ratio =
            linePrice > price ? linePrice / price : price / linePrice;
          if (ratio <= this.baseCharDrawingService.getTolerance()) {
            lineExists = true;
            break;
          }
        }

        // Add new line if no existing line is within tolerance
        if (!lineExists) {
          const time = this.baseCharDrawingService.klineData[0]
            .openTime as UTCTimestamp; // Fixed: Use `time` instead of `closePrice`
          this.addPriceLine(this.symbol, time, price);
        }
      }
    );
  }

  private addPriceLine(symbol: string, time: UTCTimestamp, price: number) {
    // Remove existing line at the same price if present
    if (this.baseCharDrawingService.horizontalLines.has(price)) {
      const existingEntry =
        this.baseCharDrawingService.horizontalLines.get(price);
      if (existingEntry) {
        existingEntry.series.removePriceLine(existingEntry.line);
        this.baseCharDrawingService.horizontalLines.delete(price);
      }
    }

    // Create and store new line
    const priceLine =
      this.baseCharDrawingService.candlestickSeries.createPriceLine({
        price,
        color: this.baseCharDrawingService.globalLineColor,
        lineWidth: 2,
        axisLabelVisible: true,
        title: getAlertName(this.symbol, price),
        lineStyle: LineStyle.Dotted,
      });

    this.baseCharDrawingService.horizontalLines.set(price, {
      line: priceLine,
      series: this.baseCharDrawingService.candlestickSeries,
      data: [{ time, value: price }],
    });
    console.log(this.baseCharDrawingService.horizontalLines);
    this.lineKlineService.addAlertBySymbolAndPrice(this.symbol, price);
  }

  goToVwapChart() {
    const urlTree = this.router.createUrlTree([VWAP_LIGHTWEIGHT_CHART], {
      queryParams: {
        symbol: this.symbol,
        category: this.category,
        imageUrl: this.imageUrl,
        tvLink: this.tvLink,
      },
    });
    const url = this.router.serializeUrl(urlTree);
    window.open(url, '_blank');
  }

  async refreshChartData() {
    await this.baseCharDrawingService.loadChartData(this.symbol);
  }

  ngOnDestroy(): void {
    this.baseCharDrawingService.destroyChart();
  }
}
