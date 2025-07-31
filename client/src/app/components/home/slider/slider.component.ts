// slider.component.ts
import { Component } from '@angular/core';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { Movie, MovieService } from '../../../services/movie.service';
import { finalize, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-slider',
  standalone: true,
  imports: [RouterLink, NgFor,NgIf, CarouselModule],
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss']
})
export class SliderComponent {
  movies_slider: Movie[] = [];
  loading = true;
  error = '';
  private destroy$ = new Subject<void>();

  constructor(private movieService: MovieService) {}

  ngOnInit() {
    this.loadMovies();
  }

  loadMovies() {
    this.loading = true;
    this.error = '';

    this.movieService.getRandomMovies(20)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (response) => {
          if (response?.data?.length) {
            this.movies_slider = response.data.slice(0, 48);
          }
        },
        error: (err) => {
          console.error('Error loading slides:', err);
          this.error = 'Không thể tải dữ liệu';
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  Slider: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: true,
    autoplay: true,
    autoplayTimeout: 20000,
    autoplayHoverPause: true,
    navSpeed:1000,
    navText: ['',''],
    center: true,
    items: 1,
    margin: 10,
    nav: true,
    lazyLoad: true,
    responsive: {
      0: {
        items: 1,
        nav: false
      },
      768: {
        items: 1,
        nav: true
      }
    }
  };

  
  handleImageError(event: any) {
    const img = event.target;
    img.src = 'assets/images/fallback.jpg'; // Add fallback image
  }
}
