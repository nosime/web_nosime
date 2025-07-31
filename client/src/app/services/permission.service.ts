// services/permission.service.ts
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  constructor(private authService: AuthService) {}

  hasPermission(requiredPermission: string): boolean {
    const user = this.authService.currentUserValue;
    if (!user) return false;

    // Kiểm tra role Admin - có toàn quyền
    if (user.RoleName === 'Admin') return true;

    // Kiểm tra permission cụ thể
    return user.Permissions?.includes(requiredPermission) || false;
  }

  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  hasAllPermissions(permissions: string[]): boolean {
    return permissions.every(permission => this.hasPermission(permission));
  }
}
