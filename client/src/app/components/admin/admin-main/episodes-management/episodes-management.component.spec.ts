import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpisodesManagementComponent } from './episodes-management.component';

describe('EpisodesManagementComponent', () => {
  let component: EpisodesManagementComponent;
  let fixture: ComponentFixture<EpisodesManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EpisodesManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EpisodesManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
