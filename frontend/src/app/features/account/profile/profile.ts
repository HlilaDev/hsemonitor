import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { AuthServices, User } from '../../../core/services/auth/auth-services';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  private auth = inject(AuthServices);

  user: User | null = null;
  loading = true;
  error = false;

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile() {
    this.loading = true;
    this.auth.me().subscribe({
      next: (res: any) => {
        this.user = res?.user ?? null;
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      },
    });
  }

  get displayName(): string {
    return this.user?.fullName || '—';
  }

  get displayRole(): string {
    return this.user?.role || '';
  }

  get avatarUrl(): string {
    return this.user?.avatarUrl || 'assets/images/profile-pic.webp';
  }
}