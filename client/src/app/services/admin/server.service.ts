// services/admin/server.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Server {
  ServerID: number;
  Name: string;
  Type: string;
  Priority: number;
  IsActive: boolean;
  CreatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ServerService {
  private apiUrl = `${environment.apiUrl}/admin/servers`;

  constructor(private http: HttpClient) { }

  getServers(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  addServer(server: Partial<Server>): Observable<any> {
    return this.http.post(this.apiUrl, server);
  }

  updateServer(id: number, server: Partial<Server>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, server);
  }

  deleteServer(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
