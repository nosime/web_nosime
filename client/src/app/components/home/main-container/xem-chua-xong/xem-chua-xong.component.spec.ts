import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XemChuaXongComponent } from './xem-chua-xong.component';

describe('XemChuaXongComponent', () => {
  let component: XemChuaXongComponent;
  let fixture: ComponentFixture<XemChuaXongComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [XemChuaXongComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(XemChuaXongComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
