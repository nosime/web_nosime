import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CarouselModule, OwlOptions, CarouselComponent, SlidesOutputData } from 'ngx-owl-carousel-o';
import { Movie, MovieService } from '../../../../services/movie.service';
import { finalize, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-phim-bo',
  standalone: true,
  imports: [RouterLink, NgFor, NgClass, CarouselModule, NgIf],
  templateUrl: './phim-bo.component.html',
  styleUrl: './phim-bo.component.css'
})
export class PhimBoComponent implements OnInit {
  movies_pb: Movie[] = [];
  currentPage = 0;
  totalPages = 6;
  loading = false;
  error = '';
  private destroy$ = new Subject<void>();

  @ViewChild('owlCar') carousel!: CarouselComponent;

  constructor(private movieService: MovieService) {}

  ngOnInit() {
    this.loadMovies();
  }

  getDots() {
    return new Array(this.totalPages);
  }

  goToPage(pageIndex: number) {
    this.currentPage = pageIndex;
    if (this.carousel) {
      this.carousel.to(String(pageIndex * 8));
    }
  }

  onSlideChange(event: SlidesOutputData) {
    if (event.startPosition !== undefined) {
      this.currentPage = Math.floor(event.startPosition / 8);
    }
  }

  prevSlide() {
    if (this.carousel) {
      this.carousel.prev();
    }
  }

  nextSlide() {
    if (this.carousel) {
      this.carousel.next();
    }
  }

  loadMovies() {
    this.loading = true;
    this.error = '';

    this.movieService.getRandomMoviesPageLimit(1,48)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (response) => {
          if (response?.data?.length) {
            this.movies_pb = response.data.slice(0, 48);
          }
        },
        error: (err) => {
          console.error('Error loading slides:', err);
          this.error = 'Không thể tải dữ liệu';
        }
      });
  }


  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: false,
    navSpeed: 300,
    navText: ['', ''],
    items: 8,
    slideBy: 8,
    lazyLoad: true,
    responsive: {
      0: {
        items: 2,
        slideBy: 2
      },
      576: {
        items: 3,
        slideBy: 3
      },
      768: {
        items: 4,
        slideBy: 4
      },
      992: {
        items: 6,
        slideBy: 6
      },
      1200: {
        items: 8,
        slideBy: 8
      }
    },
    nav: false
  };

}
