import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangeTableComponent } from './exchange-table.component';

describe('ExchangeTableComponent', () => {
  let component: ExchangeTableComponent;
  let fixture: ComponentFixture<ExchangeTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExchangeTableComponent]
    });
    fixture = TestBed.createComponent(ExchangeTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
