import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.authService.currentUser.pipe(
      map(user => {
        if (user) {
          return true;
        }

        // Chỉ lưu returnUrl khi ở môi trường browser
        if (isPlatformBrowser(this.platformId)) {
          const returnUrl = window.location.pathname;
          return this.router.createUrlTree(['/login'], {
            queryParams: { returnUrl }
          });
        }

        // Trong môi trường server, chỉ redirect đến login
        return this.router.createUrlTree(['/login']);
      })
    );
  }
}
