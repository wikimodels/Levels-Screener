import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VwapComponent } from './vwap.component';

describe('VwapComponent', () => {
  let component: VwapComponent;
  let fixture: ComponentFixture<VwapComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VwapComponent]
    });
    fixture = TestBed.createComponent(VwapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
