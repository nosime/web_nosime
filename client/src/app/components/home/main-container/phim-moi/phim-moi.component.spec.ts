import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhimMoiComponent } from './phim-moi.component';

describe('PhimMoiComponent', () => {
  let component: PhimMoiComponent;
  let fixture: ComponentFixture<PhimMoiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhimMoiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhimMoiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
