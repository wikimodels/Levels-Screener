import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertsComponent } from './vwap-alerts.component';

describe('AlertsComponent', () => {
  let component: AlertsComponent;
  let fixture: ComponentFixture<AlertsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AlertsComponent],
    });
    fixture = TestBed.createComponent(AlertsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
