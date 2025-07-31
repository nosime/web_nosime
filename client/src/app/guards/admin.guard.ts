import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { PermissionService } from '../services/permission.service';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private permissionService: PermissionService,
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const user = this.authService.currentUserValue;

    // Ensure the user is an Admin
    if (user?.RoleName === 'Admin') {
      return true;
    }

    // Redirect to the home page if the user is not an Admin
    this.router.navigate(['/']);
    return false;
  }
}
