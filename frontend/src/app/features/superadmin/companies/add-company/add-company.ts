import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import {
  CompanyServices,
  CreateCompanyDto,
} from '../../../../core/services/companies/company-services';

@Component({
  selector: 'app-add-company',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './add-company.html',
  styleUrl: './add-company.scss',
})
export class AddCompany {
  private companyService = inject(CompanyServices);
  private router = inject(Router);

  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  form = signal<CreateCompanyDto>({
    name: '',
    industry: '',
    logoUrl: '',
    address: {
      country: '',
      city: '',
      street: '',
      postalCode: '',
    },
    contacts: {
      email: '',
      phone: '',
    },
    isActive: true,
  });

  updateField<K extends keyof CreateCompanyDto>(key: K, value: CreateCompanyDto[K]): void {
    this.form.update((current) => ({
      ...current,
      [key]: value,
    }));
  }

  updateAddressField(
    key: 'country' | 'city' | 'street' | 'postalCode',
    value: string
  ): void {
    this.form.update((current) => ({
      ...current,
      address: {
        ...current.address,
        [key]: value,
      },
    }));
  }

  updateContactField(key: 'email' | 'phone', value: string): void {
    this.form.update((current) => ({
      ...current,
      contacts: {
        ...current.contacts,
        [key]: value,
      },
    }));
  }

  onSubmit(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    const payload = this.buildPayload();

    if (!payload.name?.trim()) {
      this.errorMessage.set('Company name is required.');
      return;
    }

    this.loading.set(true);

    this.companyService.createCompany(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.successMessage.set('Company created successfully.');

        setTimeout(() => {
          this.router.navigate(['/super-admin/companies']);
        }, 700);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(
          err?.error?.message || 'Failed to create company'
        );
      },
    });
  }

  private buildPayload(): CreateCompanyDto {
    const current = this.form();

    return {
      name: current.name?.trim() || '',
      industry: current.industry?.trim() || '',
      logoUrl: current.logoUrl?.trim() || '',
      address: {
        country: current.address?.country?.trim() || '',
        city: current.address?.city?.trim() || '',
        street: current.address?.street?.trim() || '',
        postalCode: current.address?.postalCode?.trim() || '',
      },
      contacts: {
        email: current.contacts?.email?.trim() || '',
        phone: current.contacts?.phone?.trim() || '',
      },
      isActive: current.isActive ?? true,
    };
  }
}