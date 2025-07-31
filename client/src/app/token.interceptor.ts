import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

export const TokenInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  let token = '';
  if (isPlatformBrowser(platformId)) {
    // Chỉ truy cập localStorage nếu đang chạy trên trình duyệt
    token = localStorage.getItem('token') || '';
  }

  const clonedRequest = req.clone({
    setHeaders: token ? { Authorization: `Bearer ${token}` } : {},
  });

  return next(clonedRequest);
};
