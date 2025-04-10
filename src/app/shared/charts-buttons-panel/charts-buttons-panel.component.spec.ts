import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartsButtonsPanelComponent } from './charts-buttons-panel.component';

describe('ChartsButtonsPanelComponent', () => {
  let component: ChartsButtonsPanelComponent;
  let fixture: ComponentFixture<ChartsButtonsPanelComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChartsButtonsPanelComponent]
    });
    fixture = TestBed.createComponent(ChartsButtonsPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
