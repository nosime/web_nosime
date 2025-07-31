import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
export interface Episode {
  EpisodeID: number;
  MovieID: number;
  ServerID: number;
  Name: string;
  Slug: string;
  FileName: string;
  EpisodeNumber: string;
  Duration?: number | null;
  VideoUrl?: string | null;
  EmbedUrl?: string | null;
  ThumbnailUrl?: string | null;
  Views: number;
  Size?: number | null;
  Quality?: string | null;
  IsProcessed: boolean;
  CreatedAt: string;
  UpdatedAt: string;
  ServerName?: string; // Nếu ServerName có trong dữ liệu trả về
}

@Injectable({
  providedIn: 'root'
})
export class EpisodesService {
  private apiUrl = `${environment.apiUrl}/admin/episodes`;

  constructor(private http: HttpClient) {}

  getEpisodes(movieId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${movieId}`);
  }

  addEpisode(episode: Episode): Observable<Episode> {
    return this.http.post<Episode>(`${this.apiUrl}`, episode);
  }

  updateEpisode(episode: Episode): Observable<Episode> {
    return this.http.put<Episode>(`${this.apiUrl}/${episode.EpisodeID}`, episode);
  }

  deleteEpisode(episodeID: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${episodeID}`);
  }
}
