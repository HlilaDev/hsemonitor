import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { AuthServices } from '../../../../core/services/auth/auth-services';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  @Output() toggleSidebar = new EventEmitter<void>();

  private readonly router = inject(Router);
  private readonly authService = inject(AuthServices);

  readonly currentDate = new Date();
  readonly adminName = signal('Super Admin');
  readonly loggingOut = signal(false);

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  logout(): void {
    if (this.loggingOut()) return;

    this.loggingOut.set(true);

    this.authService.logout().subscribe({
      next: () => {
        this.loggingOut.set(false);
        this.router.navigate(['/login']);
      },
      error: () => {
        this.loggingOut.set(false);
        this.router.navigate(['/login']);
      },
    });
  }
}