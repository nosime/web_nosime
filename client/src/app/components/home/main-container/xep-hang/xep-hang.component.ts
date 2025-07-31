import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CarouselModule, OwlOptions, CarouselComponent } from 'ngx-owl-carousel-o';
import { Movie, MovieService } from '../../../../services/movie.service';
import { finalize, Subject, takeUntil } from 'rxjs';



@Component({
  selector: 'app-xep-hang',
  standalone: true,
  imports: [RouterLink,NgFor,NgIf,NgClass,CarouselModule],
  templateUrl: './xep-hang.component.html',
  styleUrl: './xep-hang.component.css'
})

export class XepHangComponent implements OnInit {

  topMovies: Movie[] = [];
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

    this.movieService.getTopViewMovies()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (response) => {
          if (response?.data?.length) {
            this.topMovies = response.data.slice(0, 10);
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
    margin: 0,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: false,
    navSpeed: 500,
    navText: ['',''],
    lazyLoad: true,
    responsive: {
      0: {
        items: 2
      },
      576: {
        items: 3
      },
      768: {
        items: 4
      },
      992: {
        items: 5
      },
      1200: {
        items: 6
      }
    },
    nav: false
  };
}
