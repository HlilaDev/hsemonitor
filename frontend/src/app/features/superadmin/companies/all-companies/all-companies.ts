import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  Company,
  CompanyListResponse,
  CompanyServices,
} from '../../../../core/services/companies/company-services';

@Component({
  selector: 'app-all-companies',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './all-companies.html',
  styleUrl: './all-companies.scss',
})
export class AllCompanies {
  private companyService = inject(CompanyServices);

  companies = signal<Company[]>([]);
  loading = signal(false);
  deletingId = signal<string | null>(null);
  errorMessage = signal('');
  successMessage = signal('');

  q = signal('');
  activeFilter = signal('');

  page = signal(1);
  limit = signal(8);
  total = signal(0);
  pages = signal(1);

  readonly stats = computed(() => {
    const items = this.companies();
    return {
      total: this.total(),
      active: items.filter((c) => c.isActive).length,
      inactive: items.filter((c) => !c.isActive).length,
    };
  });

  constructor() {
    this.loadCompanies();
  }

  loadCompanies(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.companyService
      .getCompanies({
        page: this.page(),
        limit: this.limit(),
        q: this.q().trim(),
        isActive:
          this.activeFilter() === ''
            ? ''
            : this.activeFilter() === 'true',
      })
      .subscribe({
        next: (res: CompanyListResponse) => {
          this.companies.set(res.items || []);
          this.total.set(res.total || 0);
          this.page.set(res.page || 1);
          this.pages.set(res.pages || 1);
          this.loading.set(false);
        },
        error: (err) => {
          this.errorMessage.set(
            err?.error?.message || 'Failed to load companies'
          );
          this.loading.set(false);
        },
      });
  }

  onSearch(): void {
    this.page.set(1);
    this.loadCompanies();
  }

  onFilterChange(): void {
    this.page.set(1);
    this.loadCompanies();
  }

  goToPage(targetPage: number): void {
    if (targetPage < 1 || targetPage > this.pages()) return;
    if (targetPage === this.page()) return;

    this.page.set(targetPage);
    this.loadCompanies();
  }

  onDelete(id: string, name: string): void {
    const confirmed = window.confirm(
      `Delete company "${name}" ?`
    );

    if (!confirmed) return;

    this.deletingId.set(id);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.companyService.deleteCompany(id).subscribe({
      next: (res) => {
        this.successMessage.set(res.message || 'Company deleted successfully');

        const isLastItemOnPage = this.companies().length === 1 && this.page() > 1;
        if (isLastItemOnPage) {
          this.page.set(this.page() - 1);
        }

        this.deletingId.set(null);
        this.loadCompanies();
      },
      error: (err) => {
        this.errorMessage.set(
          err?.error?.message || 'Failed to delete company'
        );
        this.deletingId.set(null);
      },
    });
  }

  trackByCompany(_: number, company: Company): string {
    return company._id;
  }
}