import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KlineChartComponent } from './kline-chart.component';

describe('KlineChartComponent', () => {
  let component: KlineChartComponent;
  let fixture: ComponentFixture<KlineChartComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [KlineChartComponent]
    });
    fixture = TestBed.createComponent(KlineChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
