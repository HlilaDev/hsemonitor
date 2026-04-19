import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthServices } from '../../services/auth/auth-services';
import { catchError, map, of } from 'rxjs';

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthServices);
  const router = inject(Router);

  return auth.me().pipe(
    map(() => router.createUrlTree(['/'])), // si cookie valide => pas d'accès à /login
    catchError(() => of(true))              // si 401 => ok afficher /login
  );
};