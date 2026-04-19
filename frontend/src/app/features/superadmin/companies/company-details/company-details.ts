import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import {
  Company,
  CompanyServices,
} from '../../../../core/services/companies/company-services';

import {
  User,
  UserServices,
} from '../../../../core/services/users/user-services';

@Component({
  selector: 'app-company-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './company-details.html',
  styleUrl: './company-details.scss',
})
export class CompanyDetails {
  private route = inject(ActivatedRoute);
  private companyService = inject(CompanyServices);
  private userService = inject(UserServices);

  company = signal<Company | null>(null);
  admins = signal<User[]>([]);

  loading = signal(true);
  errorMessage = signal('');

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadData(id);
    }
  }

  loadData(companyId: string) {
    this.loading.set(true);

    this.companyService.getCompanyById(companyId).subscribe({
      next: (company) => {
        this.company.set(company);

        this.loadAdmins(companyId);
      },
      error: () => {
        this.errorMessage.set('Erreur chargement company');
        this.loading.set(false);
      },
    });
  }

  loadAdmins(companyId: string) {
    this.userService.getAllUsers().subscribe({
      next: (users: any) => {
        const list = Array.isArray(users) ? users : users.items || [];

        const admins = list.filter(
          (u: any) =>
            u.role === 'admin' &&
            (typeof u.company === 'object'
              ? u.company?._id === companyId
              : u.company === companyId)
        );

        this.admins.set(admins);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  getFullName(user: any): string {
    return `${user.firstName || ''} ${user.lastName || ''}`.trim();
  }
}