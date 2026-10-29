import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const permissionGuard: CanActivateFn = (route) => {
  const permission = route.data['permission'] as string | undefined;
  const auth = inject(AuthService);
  return permission && auth.hasPermission(permission)
    ? true
    : inject(Router).createUrlTree(['/acceso-denegado']);
};
