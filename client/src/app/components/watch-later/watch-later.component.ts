import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Movie } from '../../services/movie.service';
import { AccMovieService, WatchLaterMovie } from '../../services/acc-movie.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-watch-later',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './watch-later.component.html',
  styleUrl: './watch-later.component.css'
})
export class WatchLaterComponent implements OnInit {
  movies: WatchLaterMovie[] = [];
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
    this.titleService.setTitle('Danh Sách Xem Sau | WebNosime');
    this.route.params.subscribe(params => {
      this.userId = +params['userId'];
      this.loadWatchlist();
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
  loadWatchlist() {
    this.loading = true;
    this.error = '';

    this.accMovieService.getWatchlist(this.userId)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.movies = response.data as WatchLaterMovie[];
            this.totalItems = response.data.length;
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading watchlist:', err);
          this.error = 'Không thể tải danh sách phim xem sau';
          this.loading = false;
        }
      });
  }

  removeFromList(movieId: number) {
    this.accMovieService.toggleWatchLater(movieId)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.movies = this.movies.filter(m => m.MovieID !== movieId);
            this.totalItems = this.movies.length;
          }
        },
        error: (err) => {
          console.error('Error removing from watchlist:', err);
        }
      });
  }

  handleImageError(event: any) {
    event.target.src = 'assets/images/fallback-poster.jpg';
  }
}
