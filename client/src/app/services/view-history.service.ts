import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ViewHistoryRequest {
  userId: number;
  movieId: number;
  episodeId: number;
  serverId: number;
}

export interface ViewHistoryItem {
  historyId: number;
  user: {
    userId: number;
    username: string;
  };
  movie: {
    movieId: number;
    name: string;
    slug: string;  // Thêm slug
    thumbUrl: string;
    posterUrl: string;
  };
  episode: {
    episodeId: number;
    name: string;
    slug: string;  // Thêm slug
    fileName: string; // Thêm fileName
    episodeNumber: number;
  };
  server: {
    serverId: number;
    name: string;
  };
  viewDate: Date;
}

export interface ViewHistoryResponse {
  success: boolean;
  message?: string;
  data: ViewHistoryItem[];
}
@Injectable({
  providedIn: 'root'
})
export class ViewHistoryService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }

  saveHistory(data: ViewHistoryRequest): Observable<ViewHistoryResponse> {
    return this.http.post<ViewHistoryResponse>(`${this.apiUrl}/view-history`, data);
  }

  getUserHistory(userId: number): Observable<{success: boolean, data: ViewHistoryItem[]}> {
    return this.http.get<{success: boolean, data: ViewHistoryItem[]}>
      (`${this.apiUrl}/view-history-user/${userId}`);
  }
}
