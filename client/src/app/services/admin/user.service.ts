// services/user.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface User {
  UserID: number;
  Username: string;
  Email: string;
  DisplayName: string;
  IsActive: boolean;
  IsVerified: boolean;
  CreatedAt: string;
  RoleName?: string;
}

export interface UserResponse {
  success: boolean;
  data: User[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}


@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl+'/admin';

  constructor(private http: HttpClient) { }

  getUsers(page: number = 1, limit: number = 10): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/users?page=${page}&limit=${limit}`);
  }

  deleteUser(userId: number): Observable<{success: boolean; message: string}> {
    return this.http.delete<{success: boolean; message: string}>(`${this.apiUrl}/users/${userId}`);
  }
}
