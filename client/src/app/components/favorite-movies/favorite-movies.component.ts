import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Movie } from '../../services/movie.service';
import { AccMovieService } from '../../services/acc-movie.service';

@Component({
  selector: 'app-favorite-movies',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './favorite-movies.component.html',
  styleUrl: './favorite-movies.component.css'
})
export class FavoriteMoviesComponent implements OnInit {
  movies: Movie[] = [];
  loading = false;
  error = '';
  totalItems = 0;
  userId : any = '';
  constructor(
    private accMovieService: AccMovieService,
    private titleService: Title,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.titleService.setTitle('Phim Yêu Thích | WebNosime');
    this.route.params.subscribe(params => {
      this.userId = +params['userId'];
      this.loadFavorites();
    });
  }

  loadFavorites() {
    this.loading = true;
    this.error = '';

    this.accMovieService.getFavorites(this.userId)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.movies = response.data;
            this.totalItems = response.data.length;
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading favorites:', err);
          this.error = 'Không thể tải danh sách phim yêu thích';
          this.loading = false;
        }
      });
  }

  removeFavorite(movieId: number) {
    this.accMovieService.toggleLike(movieId)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.movies = this.movies.filter(m => m.MovieID !== movieId);
            this.totalItems = this.movies.length;
          }
        },
        error: (err) => {
          console.error('Error removing favorite:', err);
        }
      });
  }

  handleImageError(event: any) {
    event.target.src = 'assets/images/fallback-poster.jpg';
  }
}
