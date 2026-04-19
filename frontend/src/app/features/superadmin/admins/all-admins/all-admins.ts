import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import {
  AdminServices,
  AdminUser,
  AdminListResponse,
} from '../../../../core/services/admins/admin-services';

@Component({
  selector: 'app-all-admins',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './all-admins.html',
  styleUrl: './all-admins.scss',
})
export class AllAdmins {
  private readonly adminService = inject(AdminServices);

  admins = signal<AdminUser[]>([]);
  loading = signal(false);
  errorMessage = signal('');

  q = signal('');

  page = signal(1);
  limit = signal(8);
  total = signal(0);
  pages = signal(1);

  constructor(private router:Router) {
    this.loadAdmins();
  }

  loadAdmins(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.adminService
      .getAdmins({
        page: this.page(),
        limit: this.limit(),
        q: this.q(),
      })
      .subscribe({
        next: (res: AdminListResponse) => {
          this.admins.set(res.items || []);
          this.total.set(res.total || 0);
          this.page.set(res.page || 1);
          this.pages.set(res.pages || 1);
          this.loading.set(false);
        },
        error: (err) => {
          this.errorMessage.set(
            err?.error?.message || 'Failed to load admins'
          );
          this.loading.set(false);
        },
      });
  }

  onSearch(): void {
    this.page.set(1);
    this.loadAdmins();
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.pages()) return;
    if (p === this.page()) return;

    this.page.set(p);
    this.loadAdmins();
  }

  getAdminDisplayName(admin: AdminUser): string {
    if (admin.name?.trim()) return admin.name.trim();

    const fullName = `${admin.firstName || ''} ${admin.lastName || ''}`.trim();
    if (fullName) return fullName;

    return 'Admin';
  }

  getAdminCompanyName(admin: AdminUser): string {
    if (admin.company && typeof admin.company === 'object' && 'name' in admin.company) {
      return admin.company.name;
    }

    return '-';
  }

  trackByAdmin(_: number, admin: AdminUser): string {
    return admin._id;
  }


}