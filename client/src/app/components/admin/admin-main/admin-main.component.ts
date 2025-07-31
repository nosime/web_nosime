// admin-main.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MovieService, Movie } from '../../../services/movie.service';
import { FilterState } from '../../main-search/filter/filter.component';
import { finalize, Subject, takeUntil } from 'rxjs';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { AddMovieComponent } from './add-movie/add-movie.component';
import { EditMovieComponent } from "./edit-movie/edit-movie.component";
import { EpisodesManagementComponent } from "./episodes-management/episodes-management.component";
import { MoviesService } from '../../../services/admin/movies.service';

@Component({
  selector: 'app-admin-main',
  standalone: true,
  imports: [CommonModule, AddMovieComponent, EditMovieComponent, EpisodesManagementComponent,RouterLink],
  templateUrl: './admin-main.component.html',
  styleUrls: ['./admin-main.component.css']
})
export class AdminMainComponent implements OnInit, OnDestroy {
 movies: Movie[] = [];
   currentPage = 1;
   itemsPerPage = 24;
   totalItems = 0;
   loading = false;
   error = '';
   type: string = '';
   title: string = '';
   searchQuery: string = '';
   showEditForm = false;
   showEpisodeManager = false;

   selectedMovieId: number | null = null;
    selectedSlug: string | null = null;

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
      private moviesService: MoviesService,
     private route: ActivatedRoute,
     private router: Router,
     private titleService: Title
   ) {}
   showAddForm = false;

   toggleAddForm() {
     this.showAddForm = !this.showAddForm;
   }

   onAddSuccess() {
     this.showAddForm = false;
     this.loadMovies(); // Tải lại danh sách phim
   }
   editMovie(movie: any) {
    this.selectedMovieId = movie.MovieID;
    this.selectedSlug = movie.Slug; // Lưu ID của phim được chọn
    this.showEditForm = true; // Hiển thị form edit
    this.showAddForm = false; // Ẩn form add nếu đang mở
  }

  // Xử lý khi form edit đóng
  onEditCancel() {
    this.showEditForm = false;
    this.selectedMovieId = null;
  }
  viewEpisodes(movie: any) {
  this.selectedMovieId = movie.MovieID; // Lưu MovieID của phim
  this.showEpisodeManager = true;
  this.showEditForm = false; // Hiển thị form edit
    this.showAddForm = false; // Ẩn form add nếu đang mở
  // Hiển thị component quản lý tập phim
  }

closeEpisodeManager() {
  this.showEpisodeManager = false; // Ẩn component quản lý tập phim
  this.selectedMovieId = null; // Reset MovieID
}

  // Xử lý khi update thành công
  onEditSuccess() {
    this.showEditForm = false;
    this.selectedMovieId = null;
    this.loadMovies(); // Tải lại danh sách phim
  }

  goBack() {
    // Reset các trạng thái
    this.showAddForm = false;
    this.showEditForm = false;
    this.showEpisodeManager = false;
    this.selectedMovieId = null;
    this.selectedSlug = null;

    // Load lại danh sách phim
    this.loadMovies();
  }

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

       const page = parseInt(params['page']) || 1;


         // Load theo route (phim mới, phim bộ, phim lẻ)
         this.currentPage = page;
         this.loadMovies();


     });
   }

   deleteMovie(movie: any) {
    if (confirm(`Bạn có chắc chắn muốn xóa phim "${movie.Name}" và tất cả tập phim không?`)) {
        this.loading = true;
        this.moviesService.deleteMovie(movie.MovieID).subscribe({
          next: (response) => {
            if (response.success) {
              alert('Xóa phim thành công!');
              this.loadMovies(); // Load lại danh sách phim
            } else {
              this.error = response.message || 'Xóa phim thất bại';
            }
            this.loading = false;
          },
          error: (err) => {
            this.error = 'Không thể xóa phim';
            this.loading = false;
            console.error('Delete movie error:', err);
          }
        });
    }
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
             this.movies= response.data;
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
