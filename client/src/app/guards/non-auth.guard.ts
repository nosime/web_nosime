// src/app/guards/non-auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, map, take } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NonAuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.authService.currentUser.pipe(
      take(1), // Complete sau lần đầu emit
      map(user => {
        // Nếu chưa login thì cho phép truy cập
        if (!user) {
          return true;
        }

        // Nếu đã login thì redirect về home
        return this.router.createUrlTree(['/']);
      })
    );
  }
}
