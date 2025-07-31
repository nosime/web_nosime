import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, retry, tap, timeout, timer } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FilterState } from '../components/main-search/filter/filter.component';

export interface Episode {
  EpisodeID: number;
  Name: string;
  Slug: string;
  EpisodeNumber: number;
  VideoUrl?: string;
  EmbedUrl?: string;
}

export interface ServerEpisodes {
  serverID: number;
  serverName: string;
  serverType: string;
  episodes: Episode[];
}

export interface Movie {
  Rank?: number;
  MovieID: number;
  Name: string;
  OriginName: string;
  Slug: string;
  Description: string;
  Content: string | null;
  Type: string;
  Status: string;
  ThumbUrl: string;
  PosterUrl: string;
  BannerUrl: string | null;
  TrailerUrl: string | null;
  Duration: number | null;
  Episode_Current: string;
  Episode_Total: number;
  Quality: string;
  Language: string;
  Year: number;
  Actors: string;
  Directors: string;
  IsCopyright: boolean;
  IsSubtitled: boolean;
  IsPremium: boolean;
  IsVisible: boolean;
  Views: number;
  ViewsDay: number;
  ViewsWeek: number;
  ViewsMonth: number;
  Rating_Value: number;
  Rating_Count: number;
  CreatedAt: string;
  UpdatedAt: string;
  PublishedAt: string | null;
  TmdbId: string;
  ImdbId: string;
  TmdbRating: number;
  TmdbVoteCount: number;
  Categories: string;
  Countries: string;
}

export interface MovieDetail extends Movie {
  servers: ServerEpisodes[];
}

export interface MovieDetailResponse {
  success: boolean;
  data: MovieDetail;
}
export interface MovieResponse {
  success: boolean;
  data: Movie[];
  pagination?: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}
export interface Episode {
  EpisodeID: number;
  Name: string;
  Slug: string;
  FileName: string;
  EpisodeNumber: number;
  Duration?: number;
  VideoUrl?: string;
  EmbedUrl?: string;
}
export interface ServerEpisodes {
  serverID: number;
  serverName: string;
  serverType: string;
  episodes: Episode[];
}

export interface Category {
  CategoryID: number;
  Name: string;
  Slug: string;
  Description: string;
  DisplayOrder: number;
  IsActive: boolean;
  CreatedAt: string;
}

export interface Country {
  CountryID: number;
  Name: string;
  Slug: string;
  Code: string;
  IsActive: boolean;
}
export interface Type {
  id: string;
  name: string;
  slug: string;
}
export interface Language {
  name: string;
  slug: string;
}

export interface CategoryResponse {
  success: boolean;
  data: Category[];
}

export interface CountryResponse {
  success: boolean;
  data: Country[];
}

export interface LanguageResponse {
  success: boolean;
  data: Language[];
}

export const MOVIE_TYPES: Type[] = [
  { id: 'series', name: 'Phim Bộ', slug: 'phim-bo' },
  { id: 'single', name: 'Phim Lẻ', slug: 'phim-le' },
  { id: 'tvshows', name: 'TV Shows', slug: 'tv-shows' },
  { id: 'hoathinh', name: 'Hoạt Hình', slug: 'hoat-hinh' }
];
interface AdminMovieResponse {
  success: boolean;
  data: Movie[];
  total: number;
}

interface ActionResponse {
  success: boolean;
  message: string;
}
@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }
  getMovieTypes(): Observable<Type[]> {
    return of(MOVIE_TYPES);
  }
  private handleRequest<T>(request: Observable<T>): Observable<T> {
    return request.pipe(
      retry({
        count: 3,
        delay: (error, count) => {
          console.log(`Retry attempt ${count}`);
          return timer(1000 * count);
        },
        resetOnSuccess: true
      }),
      catchError(error => {
        if (error.status === 500 && error.error?.code === 'ENOTOPEN') {
          return this.handleRequest(request);
        }
        throw error;
      })
    );
  }
  getMoviesPage(page: number): Observable<MovieResponse> {
    return this.handleRequest(
       this.http.get<MovieResponse>(`${this.apiUrl}/movies/${page}`)
    );
      }
  getMoviesPageLimit(page: number,limit:number): Observable<MovieResponse> {
    return this.handleRequest(
       this.http.get<MovieResponse>(`${this.apiUrl}/movies/${page}/${limit}`)
    );
      }
getTopViewMovies(): Observable<MovieResponse> {
    return this.handleRequest(
       this.http.get<MovieResponse>(`${this.apiUrl}/top-views`)
    );
}
  // movie.service.ts
searchMovies(query: string, page: number): Observable<MovieResponse> {
  return this.http.get<MovieResponse>(`${this.apiUrl}/search?q=${query}&page=${page}`)
    .pipe( // Log response
      catchError(error => {
        throw error;
      })
    );
}
searchMoviesType(params: FilterState): Observable<MovieResponse> {
        let queryParams = new HttpParams();

        // Add parameters
        if (params.page) queryParams = queryParams.set('page', params.page);
        if (params.limit) queryParams = queryParams.set('limit', params.limit);
        if (params.types?.length) queryParams = queryParams.set('types', params.types.join(','));
        if (params.categories?.length) queryParams = queryParams.set('categories', params.categories.join(','));
        if (params.countries?.length) queryParams = queryParams.set('countries', params.countries.join(','));
        if (params.status?.length) queryParams = queryParams.set('status', params.status.join(','));
        if (params.years?.length) queryParams = queryParams.set('years', params.years.join(','));
        if (params.languages?.length) queryParams = queryParams.set('languages', params.languages.join(','));

        return this.http.get<MovieResponse>(`${this.apiUrl}/filter`, {
            params: queryParams
        }).pipe(
            timeout(10000), // Timeout after 10s
            retry(3), // Retry 3 times
            catchError((error) => {
                console.error('Filter error:', error);
                throw error;
            })
        );
}

    getCategories(): Observable<any> {
      return this.http.get<CategoryResponse>(`${this.apiUrl}/categories`).pipe(
        timeout(5000),
        retry(3),
        catchError(error => {
          console.error('Error fetching categories:', error);
          return of({ success: true, data: [] });
        })
      );
    }

    getCountries(): Observable<any> {
      return this.http.get<CountryResponse>(`${this.apiUrl}/countries`).pipe(
        timeout(5000),
        retry(3),
        catchError(error => {
          console.error('Error fetching countries:', error);
          return of({ success: true, data: [] });
        })
      );
    }
    getLanguages(): Observable<LanguageResponse> {
      return this.http.get<LanguageResponse>(`${this.apiUrl}/languages`)
        .pipe(
          timeout(5000),
          retry(3),
          catchError(error => {
            console.error('Error fetching languages:', error);
            return of({ success: true, data: [] });
          })
        );
    }
  getRandomMoviesLimit(limit:number): Observable<MovieResponse> {
    return this.handleRequest(
       this.http.get<MovieResponse>(`${this.apiUrl}/movies-rdns/${limit}`)
    );
      }
  getRandomMovies(limit:number): Observable<MovieResponse> {
        return this.handleRequest(
           this.http.get<MovieResponse>(`${this.apiUrl}/movies-rdns/${limit}`)
        );
          }
  getRandomMoviesPage(page:number): Observable<MovieResponse> {
    return this.handleRequest(
       this.http.get<MovieResponse>(`${this.apiUrl}/movies-rdn/${page}`)
    );
      }
  getRandomMoviesPageLimit(page:number,limit:number): Observable<MovieResponse> {
    return this.handleRequest(
       this.http.get<MovieResponse>(`${this.apiUrl}/movies-rdn/${page}/${limit}`)
    );
      }

      getMovieBySlug(slug: string): Observable<MovieDetailResponse> {
        return this.http.get<MovieDetailResponse>(`${this.apiUrl}/movie/${slug}`)
        .pipe(
          catchError(error => {
            console.error('Error fetching movie:', error);
            throw error;
          })
        );
      }
}
