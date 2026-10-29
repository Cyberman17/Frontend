import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const session = inject(AuthService).session();
  if (!request.url.startsWith(environment.apiUrl) || !session) return next(request);
  return next(
    request.clone({
      setHeaders: { Authorization: `${session.tipo} ${session.token}` },
    }),
  );
};
