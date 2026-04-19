import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import {
  Company,
  CompanyListResponse,
  CompanyServices,
} from '../../../../core/services/companies/company-services';
import { UserServices } from '../../../../core/services/users/user-services';

@Component({
  selector: 'app-add-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './add-admin.html',
  styleUrl: './add-admin.scss',
})
export class AddAdmin {
  private readonly companyService = inject(CompanyServices);
  private readonly userService = inject(UserServices);
  private readonly router = inject(Router);

  loading = signal(false);
  loadingCompanies = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  firstName = signal('');
  lastName = signal('');
  email = signal('');
  password = signal('');
  confirmPassword = signal('');
  companyId = signal('');
  isActive = signal(true);

  showPassword = signal(false);
  showConfirmPassword = signal(false);

  companies = signal<Company[]>([]);

  readonly fullNamePreview = computed(() => {
    return `${this.firstName().trim()} ${this.lastName().trim()}`.trim();
  });

  readonly selectedCompanyName = computed(() => {
    const selected = this.companies().find((c) => c._id === this.companyId());
    return selected?.name || 'Aucune company sélectionnée';
  });

  readonly formInvalid = computed(() => {
    return (
      !this.firstName().trim() ||
      !this.lastName().trim() ||
      !this.email().trim() ||
      !this.password().trim() ||
      !this.confirmPassword().trim() ||
      !this.companyId() ||
      this.password() !== this.confirmPassword()
    );
  });

  constructor() {
    this.loadCompanies();
  }

  loadCompanies(): void {
    this.loadingCompanies.set(true);
    this.errorMessage.set('');

    this.companyService
      .getCompanies({
        page: 1,
        limit: 200,
        q: '',
        isActive: '',
      })
      .subscribe({
        next: (res: CompanyListResponse) => {
          this.companies.set(res.items || []);
          this.loadingCompanies.set(false);
        },
        error: (err) => {
          this.errorMessage.set(
            err?.error?.message || 'Impossible de charger les companies'
          );
          this.loadingCompanies.set(false);
        },
      });
  }

  submit(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.formInvalid()) {
      this.errorMessage.set(
        'Veuillez remplir tous les champs obligatoires et vérifier le mot de passe.'
      );
      return;
    }

    this.loading.set(true);

    const payload = {
      firstName: this.firstName().trim(),
      lastName: this.lastName().trim(),
      email: this.email().trim(),
      password: this.password(),
      role: 'admin',
      company: this.companyId(),
      isActive: this.isActive(),
    };

    this.userService.addUser(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.successMessage.set('Administrateur ajouté avec succès.');
        this.resetForm();

        setTimeout(() => {
          this.router.navigate(['/super/admins']);
        }, 800);
      },
      error: (err: { error: { message: any; }; }) => {
        this.loading.set(false);
        this.errorMessage.set(
          err?.error?.message || 'Échec de création de l’administrateur'
        );
      },
    });
  }

  resetForm(): void {
    this.firstName.set('');
    this.lastName.set('');
    this.email.set('');
    this.password.set('');
    this.confirmPassword.set('');
    this.companyId.set('');
    this.isActive.set(true);
  }
}