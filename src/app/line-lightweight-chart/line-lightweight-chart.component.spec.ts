import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LineLightweightChartComponent } from './line-lightweight-chart.component';

describe('LineLightweightChartComponent', () => {
  let component: LineLightweightChartComponent;
  let fixture: ComponentFixture<LineLightweightChartComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LineLightweightChartComponent]
    });
    fixture = TestBed.createComponent(LineLightweightChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
