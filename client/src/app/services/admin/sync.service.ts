import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface SyncResponse {
  success: boolean;
  message: string;
  data?: any;
  stats?: any;
  results?: any;
}

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Sync categories
  syncCategories(): Observable<SyncResponse> {
    return this.http.post<SyncResponse>(`${this.apiUrl}/categories/sync`, {});
  }

  // Sync countries
  syncCountries(): Observable<SyncResponse> {
    return this.http.post<SyncResponse>(`${this.apiUrl}/countries/sync`, {});
  }

  // Sync movies (24 movies)
  syncMovies(): Observable<SyncResponse> {
    return this.http.post<SyncResponse>(`${this.apiUrl}/movies/sync-all`, {});
  }

  // Parallel sync movies (2400 movies)
  parallelSyncMovies(): Observable<SyncResponse> {
    return this.http.post<SyncResponse>(`${this.apiUrl}/movies/parallel-sync`, {});
  }

  // Clean all movies
  cleanAllMovies(): Observable<SyncResponse> {
    return this.http.post<SyncResponse>(`${this.apiUrl}/movies/clean-all`, {});
  }
}