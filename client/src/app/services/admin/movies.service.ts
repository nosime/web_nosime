import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
export interface MovieCreate {
  Name: string;
  OriginName: string;
  Description: string;
  Type: string;
  Status: string;
  ThumbUrl: string;
  PosterUrl: string;
  TrailerUrl?: string;
  Year: number;
  Language: string;
  Actors?: string;
  Directors?: string;
  Categories: string[];
  Countries: string[];
}
@Injectable({
  providedIn: 'root'
})
export class MoviesService {

    private apiUrl = environment.apiUrl+'/admin';

      constructor(private http: HttpClient) { }
    addMovie(movieData: MovieCreate): Observable<any> {
      return this.http.post<any>(`${this.apiUrl}/add-movies`, movieData);
    }

    // Lấy danh sách categories và countries cho form
    getCategories(): Observable<any> {
      return this.http.get<any>(`${this.apiUrl}/categories`);
    }

    getCountries(): Observable<any> {
      return this.http.get<any>(`${this.apiUrl}/countries`);
    }
    updateMovie(movieId: number, movieData: any): Observable<any> {
      return this.http.put(`${this.apiUrl}/update-movies/${movieId}`, movieData);
    }
    deleteMovie(movieId: number): Observable<any> {
      return this.http.delete(`${this.apiUrl}/delete-movies/${movieId}`);
    }
}
