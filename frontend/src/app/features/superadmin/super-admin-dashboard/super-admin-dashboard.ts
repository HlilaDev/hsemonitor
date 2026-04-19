import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import {
  Company,
  CompanyListResponse,
  CompanyServices,
} from '../../../core/services/companies/company-services';
import {
  User,
  UserServices,
} from '../../../core/services/users/user-services';

type DashboardUser = User & {
  role?: string;
  company?: {
    _id: string;
    name: string;
    industry?: string;
  } | string;
};

@Component({
  selector: 'app-super-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './super-admin-dashboard.html',
  styleUrl: './super-admin-dashboard.scss',
})
export class SuperAdminDashboard {
  private readonly companyService = inject(CompanyServices);
  private readonly userService = inject(UserServices);

  loading = signal(true);
  errorMessage = signal('');

  companies = signal<Company[]>([]);
  users = signal<DashboardUser[]>([]);

  readonly totalCompanies = computed(() => this.companies().length);

  readonly activeCompanies = computed(
    () => this.companies().filter((company) => company.isActive !== false).length
  );

  readonly inactiveCompanies = computed(
    () => this.companies().filter((company) => company.isActive === false).length
  );

  readonly totalAdmins = computed(
    () => this.users().filter((user) => user.role === 'admin').length
  );

  readonly recentCompanies = computed(() =>
    [...this.companies()]
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      )
      .slice(0, 5)
  );

  readonly recentAdmins = computed(() =>
    this.users()
      .filter((user) => user.role === 'admin')
      .slice(0, 5)
  );

  constructor() {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    forkJoin({
      companies: this.companyService.getCompanies({
        page: 1,
        limit: 200,
        q: '',
        isActive: '',
      }),
      users: this.userService.getAllUsers(),
    }).subscribe({
      next: (res: {
        companies: CompanyListResponse;
        users: DashboardUser[] | { items?: DashboardUser[] };
      }) => {
        const companies = res.companies?.items || [];

        const users = Array.isArray(res.users)
          ? res.users
          : Array.isArray(res.users?.items)
          ? res.users.items
          : [];

        this.companies.set(companies);
        this.users.set(users);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(
          err?.error?.message || err?.message || 'Failed to load dashboard'
        );
        this.loading.set(false);
      },
    });
  }

  getUserDisplayName(user: DashboardUser): string {
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    return fullName || user.email || 'Admin';
  }

  getCompanyName(user: DashboardUser): string {
    if (user.company && typeof user.company === 'object' && 'name' in user.company) {
      return user.company.name;
    }

    return '-';
  }

  trackByCompany(_: number, company: Company): string {
    return company._id;
  }

  trackByUser(_: number, user: DashboardUser): string {
    return user._id || user.email;
  }
}