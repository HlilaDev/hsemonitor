import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../auth/auth-services';

@Injectable({
  providedIn: 'root',
})
export class RoleRedirectServices {
  constructor(private router: Router) {}

  getHomeRouteByRole(role?: User['role']): string {
    switch (role) {
      case 'manager':
        return '/manager';

      case 'admin':
        return '/admin';

      case 'superAdmin':
        return '/super';

      case 'agent':
        return '/agent';

      

      default:
        return '/login';
    }
  }

  redirectByRole(user: User | null | undefined): void {
    const route = this.getHomeRouteByRole(user?.role);
    this.router.navigate([route]);
  }
}