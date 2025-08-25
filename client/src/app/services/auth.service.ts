// src/app/services/auth.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';

// Define interfaces
export interface User {
  UserID: number;
  Username: string;
  Email: string;
  DisplayName?: string;
  Avatar?: string;
  IsVerified: boolean;
  IsActive: boolean;
  IsPremium: boolean;
  RoleName?: string;
  Permissions?: string[]; // Thêm mảng permissions
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    user: User;
    token: string;
    permissions?: string[]; // Thêm permissions vào response
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private isBrowser: boolean;
  private permissions: string[] = [];

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.currentUserSubject = new BehaviorSubject<User | null>(null);
    this.currentUser = this.currentUserSubject.asObservable();

    if (this.isBrowser) {
      const userData = this.getUserFromStorage();
      this.currentUserSubject.next(userData);
      const storedPermissions = localStorage.getItem('permissions');
      if (storedPermissions) {
        this.permissions = JSON.parse(storedPermissions);
      }
    }
  }


  // Các phương thức kiểm tra quyền
  hasPermission(permission: string): boolean {
    if (this.currentUserValue?.RoleName === 'Admin') return true;
    return this.permissions.includes(permission);
  }

  hasAnyPermission(permissions: string[]): boolean {
    if (this.currentUserValue?.RoleName === 'Admin') return true;
    return permissions.some(p => this.permissions.includes(p));
  }

  hasAllPermissions(permissions: string[]): boolean {
    if (this.currentUserValue?.RoleName === 'Admin') return true;
    return permissions.every(p => this.permissions.includes(p));
  }

  private getUserFromStorage(): User | null {
    if (!this.isBrowser) return null;

    try {
      const userData = localStorage.getItem('currentUser');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  private setUserData(user: User, token: string, permissions: string[] = []): void {
    if (!this.isBrowser) return;

    try {
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('token', token);
      localStorage.setItem('permissions', JSON.stringify(permissions));
      this.permissions = permissions;
      this.currentUserSubject.next(user);
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  // Method to update current user data
  public updateCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
    if (this.isBrowser) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;

    const payload = JSON.parse(atob(token.split('.')[1])); // Decode token
    return Date.now() < payload.exp * 1000; // Kiểm tra hạn của token
  }
  public hasRole(role: string): boolean {
    return this.currentUserValue?.RoleName === role;
  }

  public getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem('token');
  }


  public login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, { username, password })
      .pipe(
        map(response => {
          if (response.success && response.data) {
            this.setUserData(
              response.data.user,
              response.data.token,
              response.data.permissions || []
            );
          }
          return response;
        })
      );
  }

  public logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token');
      localStorage.removeItem('permissions');
      this.permissions = [];
    }
    this.currentUserSubject.next(null);
  }

  // Thêm phương thức lấy permissions hiện tại
  getPermissions(): string[] {
    return this.permissions;
  }

  public register(userData: {
    username: string;
    email: string;
    password: string;
    displayName?: string;
  }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, userData);
  }



  public refreshUserData(): Observable<AuthResponse> {
    return this.http.get<AuthResponse>(`${environment.apiUrl}/auth/me`)
      .pipe(
        map(response => {
          if (response.success && response.data?.user) {
            this.setUserData(
              response.data.user,
              response.data.token || this.getToken() || '',
              response.data.permissions || []
            );
          }
          return response;
        })
      );
  }

  // Get user profile
  public getProfile(): Observable<AuthResponse> {
    return this.http.get<AuthResponse>(`${environment.apiUrl}/profile`);
  }

  // Update user profile
  public updateProfile(profileData: {
    displayName?: string;
    email?: string;
  }): Observable<AuthResponse> {
    return this.http.put<AuthResponse>(`${environment.apiUrl}/profile`, profileData);
  }

  // Change password
  public changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/profile/change-password`, passwordData);
  }

  
}
