import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

export const authErrorInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return next(request).pipe(
    catchError((error: unknown) => {
      const isLogin = request.url === `${environment.apiUrl}/auth/login`;
      if (error instanceof HttpErrorResponse && error.status === 401 && !isLogin) {
        const returnUrl = router.url;
        auth.clearSession();
        void router.navigate(['/login'], { queryParams: { returnUrl } });
      }
      return throwError(() => error);
    }),
  );
};
