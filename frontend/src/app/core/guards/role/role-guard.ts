import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthServices } from '../../services/auth/auth-services';
import { catchError, map, of } from 'rxjs';

export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthServices);
  const router = inject(Router);

  const allowedRoles = route.data?.['roles'] as string[] | undefined;

  return auth.me().pipe(
    map(({ user }) => {
      if (!allowedRoles || allowedRoles.includes(user.role)) return true;
      return router.createUrlTree(['/404']);
    }),
    catchError(() => of(router.createUrlTree(['/login'])))
  );
};