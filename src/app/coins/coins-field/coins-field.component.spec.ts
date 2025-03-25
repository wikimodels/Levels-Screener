import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoinsFieldComponent } from './coins-field.component';

describe('CoinsFieldComponent', () => {
  let component: CoinsFieldComponent;
  let fixture: ComponentFixture<CoinsFieldComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CoinsFieldComponent]
    });
    fixture = TestBed.createComponent(CoinsFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
