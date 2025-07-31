import { TestBed } from '@angular/core/testing';

import { AccMovieService } from './acc-movie.service';

describe('AccMovieService', () => {
  let service: AccMovieService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccMovieService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
