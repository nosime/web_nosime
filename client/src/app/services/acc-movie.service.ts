// acc-movie.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Movie } from './movie.service';

export interface MovieStatus {
  inWatchLater: boolean;
  isLiked: boolean;
}

export interface ActionResponse {
  success: boolean;
  added?: boolean;
  liked?: boolean;
  message?: string;
}

export interface WatchLaterMovie extends Movie {
  Notes?: string;
  AddedDate?: string;
  Priority?: number;
}

export interface MovieListResponse {
  success: boolean;
  data: Movie[] | WatchLaterMovie[];
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AccMovieService {
  private apiUrl = environment.apiUrl ;
  constructor(private http: HttpClient) { }

  // Lấy danh sách phim yêu thích
  getFavorites(userId: number): Observable<MovieListResponse> {
    return this.http.get<MovieListResponse>(`${this.apiUrl}/favorites/${userId}`);
  }

  // Lấy danh sách phim xem sau
  getWatchlist(userId: number): Observable<MovieListResponse> {
    return this.http.get<MovieListResponse>(`${this.apiUrl}/watch-later/${userId}`);
  }

  // Đánh dấu phim đã xem
  markAsWatched(movieId: number): Observable<ActionResponse> {
    return this.http.post<ActionResponse>(`${this.apiUrl}/watch-later/mark-watched`, { movieId });
  }

  // Các phương thức cũ giữ nguyên
  checkMovieStatus(movieId: number): Observable<MovieStatus> {
    return this.http.get<MovieStatus>(`${this.apiUrl}/movies-status/${movieId}`);
  }

  toggleWatchLater(movieId: number): Observable<ActionResponse> {
    return this.http.post<ActionResponse>(`${this.apiUrl}/watch-later/toggle`, { movieId });
  }

  toggleLike(movieId: number): Observable<ActionResponse> {
    return this.http.post<ActionResponse>(`${this.apiUrl}/movies/toggle-like`, { movieId });
  }
}
