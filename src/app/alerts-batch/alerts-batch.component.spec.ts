import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertsBatchComponent } from './alerts-batch.component';

describe('AlertsBatchComponent', () => {
  let component: AlertsBatchComponent;
  let fixture: ComponentFixture<AlertsBatchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AlertsBatchComponent]
    });
    fixture = TestBed.createComponent(AlertsBatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
