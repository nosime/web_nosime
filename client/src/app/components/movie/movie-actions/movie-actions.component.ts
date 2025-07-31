import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieService } from '../../../services/movie.service';
import { AccMovieService } from '../../../services/acc-movie.service';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-movie-actions',
  standalone: true,
  imports: [],
  templateUrl: './movie-actions.component.html',
  styleUrl: './movie-actions.component.css'
})
export class MovieActionsComponent {
  @Input() movieId!: number;
  isInList = false;
  isLiked = false;

  constructor(
    private movieService: MovieService,
    private authService: AuthService,
    private accMovieService: AccMovieService,
    private router: Router
  ) {}

  ngOnInit() {
    this.checkMovieStatus();
  }

  private checkMovieStatus() {
    if (this.authService.isLoggedIn()) {
      this.accMovieService.checkMovieStatus(this.movieId).subscribe({
        next: (status) => {
          this.isInList = status.inWatchLater;
          this.isLiked = status.isLiked;
        }
      });
    }
  }

  // movie-actions.component.ts
onLike(event: Event) {
  event.stopPropagation();
  if (!this.authService.isLoggedIn()) {
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: this.router.url }
    });
    return;
  }

  this.accMovieService.toggleLike(this.movieId).subscribe({
    next: (response) => {
      // Thêm kiểm tra null/undefined
      this.isLiked = response.liked ?? false;
      // hoặc
      // this.isLiked = Boolean(response.liked);
    }
  });
}

// Tương tự cho onAddToList
onAddToList(event: Event) {
  event.stopPropagation();
  if (!this.authService.isLoggedIn()) {
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: this.router.url }
    });
    return;
  }

  this.accMovieService.toggleWatchLater(this.movieId).subscribe({
    next: (response) => {

      this.isInList = response.added ?? false;

    }
  });
}
}
