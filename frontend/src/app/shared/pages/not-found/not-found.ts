import { Component, inject } from '@angular/core';
import { Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import { catchError, of } from 'rxjs';

import { AuthServices, User } from '../../../core/services/auth/auth-services';
import { RoleRedirectServices } from '../../../core/services/redirect/role-redirect-services';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './not-found.html',
  styleUrl: './not-found.scss',
})
export class NotFound {
  private location = inject(Location);
  private authService = inject(AuthServices);
  private roleRedirect = inject(RoleRedirectServices);

  goBack() {
    this.location.back();
  }

  goHome() {
    this.authService.me()
      .pipe(catchError(() => of(null)))
      .subscribe((res: { user: User } | null) => {
        this.roleRedirect.redirectByRole(res?.user ?? null);
      });
  }
}