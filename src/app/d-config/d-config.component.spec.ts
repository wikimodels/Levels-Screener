import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DConfigComponent } from './d-config.component';

describe('DConfigComponent', () => {
  let component: DConfigComponent;
  let fixture: ComponentFixture<DConfigComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DConfigComponent]
    });
    fixture = TestBed.createComponent(DConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
