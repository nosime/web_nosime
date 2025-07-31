import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovieEpisodesComponent } from './movie-episodes.component';

describe('MovieEpisodesComponent', () => {
  let component: MovieEpisodesComponent;
  let fixture: ComponentFixture<MovieEpisodesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovieEpisodesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MovieEpisodesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
