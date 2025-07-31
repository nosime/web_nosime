import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { Movie, MovieService } from '../../../services/movie.service';
import { FilterComponent, FilterState } from '../filter/filter.component';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-search-result',
  standalone: true,
  imports: [CommonModule, RouterLink, FilterComponent],
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.css']
})
export class SearchResultComponent implements OnInit, OnDestroy {
  movies_search: Movie[] = [];
  currentPage = 1;
  itemsPerPage = 24;
  totalItems = 0;
  loading = false;
  error = '';
  type: string = '';
  title: string = '';
  searchQuery: string = '';


  currentFilters: FilterState = {
    types: [],
    categories: [],
    countries: [],
    languages: [],
    status: [],
    years: []
  };

  private destroy$ = new Subject<void>();

  constructor(
    private movieService: MovieService,
    private route: ActivatedRoute,
    private router: Router,
    private titleService: Title
  ) {}

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.type = data['type'];
      this.title = data['title'];
      if (this.type) {
        this.currentFilters.types = [this.type];
      }
    });
    const movieTitle =  this.title || this.searchQuery || 'Đang cập nhật';
    this.titleService.setTitle(`WebNosime | ${movieTitle}`);

    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['q'] || '';
      const page = parseInt(params['page']) || 1;

      if (this.searchQuery) {
        // Tìm kiếm
        this.searchMovies(this.searchQuery, page);
      } else {
        // Load theo route (phim mới, phim bộ, phim lẻ)
        this.currentPage = page;
        this.loadMovies();
      }

    });
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get pages(): number[] {
    const pageNumbers: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      if (i === 1 || i === this.totalPages ||
          (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
        pageNumbers.push(i);
      }
    }
    return pageNumbers;
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadMovies(); // Gọi lại API với trang mới
      window.scrollTo(0, 0);
    }
  }

  onFilterChange(filters: FilterState) {
    this.currentFilters = filters;
    this.currentPage = 1; // Reset về trang 1 khi filter thay đổi
    this.loadMovies();
  }

  private searchMovies(query: string, page: number) {

    this.loading = true;
    this.error = '';

    this.movieService.searchMovies(query, page)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loading = false;

        })
      )
      .subscribe({
        next: (response) => {

          if (response?.data) {
            this.movies_search = response.data;
            this.totalItems = response.pagination?.totalItems || 0;
            this.title = `Kết quả tìm kiếm: ${query} (${this.totalItems} phim)`;

          } else {
            console.log('No data in response');
            this.movies_search = [];
            this.totalItems = 0;

          }
        },
        error: (err) => {

          this.error = 'Không thể tải dữ liệu';
          this.movies_search = [];
          this.totalItems = 0;
        }
      });
}

  private loadMovies() {
    const params: FilterState = {
      ...this.currentFilters,
      page: this.currentPage.toString(),
      limit: this.itemsPerPage.toString()
    };

    this.loading = true;
    this.error = '';

    this.movieService.searchMoviesType(params)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (response) => {
          if (response?.data) {
            this.movies_search = response.data;
            this.totalItems = response.pagination?.totalItems || 0;
          }
        },
        error: (err) => {
          console.error('Error loading movies:', err);
          this.error = 'Không thể tải dữ liệu';
        }
      });
  }

}
