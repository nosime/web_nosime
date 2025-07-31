import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XepHangComponent } from './xep-hang.component';

describe('XepHangComponent', () => {
  let component: XepHangComponent;
  let fixture: ComponentFixture<XepHangComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [XepHangComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(XepHangComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
