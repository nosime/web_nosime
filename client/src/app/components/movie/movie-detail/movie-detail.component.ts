import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Episode, MovieDetail, MovieService, ServerEpisodes } from '../../../services/movie.service';
import { MovieEpisodesComponent } from "../movie-episodes/movie-episodes.component";
import { Title } from '@angular/platform-browser';
import { MovieActionsComponent } from "../movie-actions/movie-actions.component";

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [CommonModule, MovieEpisodesComponent, MovieActionsComponent],
  templateUrl: './movie-detail.component.html',
  styleUrls: ['./movie-detail.component.css']
})
export class MovieDetailComponent implements OnInit, OnDestroy {
  movie: MovieDetail | null = null;
  loading = false;
  error = '';
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService,
    private titleService: Title
  ) {}
// Thêm getter để kiểm tra servers
get hasServers(): boolean {
  return !!this.movie?.servers && this.movie.servers.length > 0;
}

// Lấy danh sách servers an toàn
get movieServers(): ServerEpisodes[] {
  return this.movie?.servers || [];
}
  ngOnInit() {

    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const slug = params['slug'];
        if (slug) {
          this.loadMovieDetails(slug);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  scrollToPlayer() {
    const playerElement = document.querySelector('.movie-player');
    if (playerElement) {
      window.scrollTo({
        top: 730,
        behavior: 'smooth'
      });
    }
  }
  private loadMovieDetails(slug: string) {
    this.loading = true;
    this.error = '';

    this.movieService.getMovieBySlug(slug)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.movie = response.data;
            const movieTitle = this.movie?.Name || 'Đang cập nhật';
            this.titleService.setTitle(`WebNosime | ${movieTitle}`);
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Không thể tải thông tin phim';
          this.loading = false;
        }
      });
  }
  formatDescription(description: string): string {
    if (!description) return '';
    return description.replace(/<\/?p>/g, '').replace(/&nbsp;/g, ' ').trim();
  }
  isDescriptionExpanded = false;

  toggleDescription() {
    this.isDescriptionExpanded = !this.isDescriptionExpanded;
  }
  formatEpisodeInfo(): string {
    if (!this.movie) return '';

    const currentEpisode = this.movie.Episode_Current ?? 'Full';

    return this.movie.Episode_Total ?
      `${currentEpisode}/${this.movie.Episode_Total} tập` :
      'Phim lẻ';
  }

}
