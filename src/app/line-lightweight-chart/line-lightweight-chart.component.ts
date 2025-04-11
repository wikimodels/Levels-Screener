import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { UTCTimestamp, MouseEventParams, LineStyle } from 'lightweight-charts';

import { ActivatedRoute } from '@angular/router';
import { LineTwChartService } from 'src/service/kline/line-tw-chart.service';
import { roundToMatchDecimals } from 'src/functions/round-to-match-decimals';
import { BaseChartDrawingService } from 'src/service/kline/base-chart-drawing.service';

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
  isRotating = false;
  symbol!: string;
  imageUrl!: string;
  category!: string;
  tvLink!: string;

  constructor(
    private route: ActivatedRoute,
    private lineKlineService: LineTwChartService,
    private baseCharDrawingService: BaseChartDrawingService
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
    this.baseCharDrawingService.chart.subscribeCrosshairMove((param) => {
      // Case 1: Mouse leaves chart area
      if (!param.point?.y) {
        if (this.baseCharDrawingService.highlightedPrice !== undefined) {
          this.baseCharDrawingService.horizontalLines
            .get(this.baseCharDrawingService.highlightedPrice)
            ?.line.applyOptions({
              color: this.baseCharDrawingService.globalLineColor, // Original color from addPriceLine
              lineWidth: 2, // Original line width
              lineStyle: LineStyle.Solid, // Original style
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

      // Case 2: Price doesn't match any line
      if (
        price === null ||
        !this.baseCharDrawingService.horizontalLines.has(price)
      ) {
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

      // Case 3: Price matches a line
      if (this.baseCharDrawingService.highlightedPrice !== price) {
        // Apply new highlight
        this.baseCharDrawingService.horizontalLines
          .get(price)
          ?.line.applyOptions({
            color: '#FF0000', // Highlight color
            lineWidth: 3, // Thicker line
            lineStyle: LineStyle.Solid, // More visible style
          });
        this.baseCharDrawingService.highlightedPrice = price;
      }
    });
  }
  refreshChartData() {
    this.baseCharDrawingService.loadChartData(this.symbol);
  }
  setupClickHandler() {
    this.baseCharDrawingService.chart.subscribeClick(
      (params: MouseEventParams) => {
        if (!params.point) return;
        const clickedTime = params.time as UTCTimestamp;
        // Use the candlestick series to calculate the price from the Y coordinate
        const rawPrice =
          this.baseCharDrawingService.candlestickSeries.coordinateToPrice(
            params.point.y
          );
        const price = roundToMatchDecimals(
          this.baseCharDrawingService.klineData[0].closePrice,
          Number(rawPrice)
        );

        if (price === null) return; // Handle edge cases
        if (this.baseCharDrawingService.horizontalLines.has(price)) {
          // Remove existing line
          const line = this.baseCharDrawingService.horizontalLines.get(price)!;
          console.log('--> line', line);
          const entry = this.baseCharDrawingService.horizontalLines.get(price);
          if (entry) {
            entry.series.removePriceLine(entry.line); // Use stored line [[7]]
            this.baseCharDrawingService.horizontalLines.delete(price);
          }
          this.lineKlineService.deleteAlertBySymbolAndPrice(this.symbol, price);
        }
        //this.addPriceLine(clickedTime, price);
        this.baseCharDrawingService.chart.timeScale().fitContent();
        // if (this.horizontalLines.has(roundedPrice)) {
        //   this.removePriceLine(roundedPrice);
        // } else {
        //   this.addPriceLine(roundedPrice);
        // }
      }
    );
  }

  private addPriceLine(time: UTCTimestamp, price: number) {
    console.log('time:', time, 'price:', price);

    // Store in Map with time as key
    const priceLine =
      this.baseCharDrawingService.candlestickSeries.createPriceLine({
        price,
        color: '#2962FF',
        lineWidth: 2,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
      });

    this.baseCharDrawingService.horizontalLines.set(price, {
      line: priceLine,
      series: this.baseCharDrawingService.candlestickSeries,
      data: [{ time, value: price }],
    });
    console.log('horizLines', this.baseCharDrawingService.horizontalLines);
    this.lineKlineService.addAlertBySymbolAndPrice(this.symbol, price);
  }

  private removePriceLine(price: number) {
    // const priceLine = this.horizontalLines.get(price);
    // if (priceLine) {
    //   this.alertSeries.removePriceLine(priceLine);
    //   this.horizontalLines.delete(price);
    //   this.lineKlineService.deleteAlertBySymbolAndPrice(this.symbol, price);
    // }
  }

  ngOnDestroy(): void {
    this.baseCharDrawingService.destroyChart();
  }
}
