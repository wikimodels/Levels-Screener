import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZoomViewerComponent } from './zoom-viewer.component';

describe('ZoomViewerComponent', () => {
  let component: ZoomViewerComponent;
  let fixture: ComponentFixture<ZoomViewerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ZoomViewerComponent]
    });
    fixture = TestBed.createComponent(ZoomViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
