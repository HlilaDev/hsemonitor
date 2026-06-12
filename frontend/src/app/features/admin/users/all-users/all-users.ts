import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { UserServices } from '../../../../core/services/users/user-services';
import { ConfirmModalService } from '../../../../core/services/confirm-modal/confirm-modal.service';
import { ToastService } from '../../../../core/services/toast/toast.service';

export type UserRole = 'agent' | 'manager' | 'admin' | 'supervisor';

export type User = {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
};

@Component({
  selector: 'app-all-users',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe, TranslateModule],
  templateUrl: './all-users.html',
  styleUrl: './all-users.scss',
})
export class AllUsers {
  private userService = inject(UserServices);
  private confirmModal = inject(ConfirmModalService);
  private toast = inject(ToastService);

  users: User[] = [];
  loading = true;
  errorMessage = '';

  constructor() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.errorMessage = '';

    this.userService.getAllUsers().subscribe({
      next: (res: any) => {
        this.users = res?.items ?? res?.users ?? res ?? [];
        this.loading = false;
      },
      error: (e: any) => {
        this.errorMessage = e?.message || 'Erreur lors du chargement des utilisateurs';
        this.loading = false;
      },
    });
  }

  trackById = (_: number, u: User) => u?._id || u?.email;

  fullName(u: User) {
    return `${u.firstName} ${u.lastName}`.trim();
  }

  roleText(role: UserRole) {
    if (role === 'admin') return 'Admin';
    if (role === 'manager') return 'Manager';
    if (role === 'supervisor') return 'Supervisor';
    return 'Agent';
  }

  roleIcon(role: UserRole) {
    if (role === 'admin') return 'bi-shield-fill';
    if (role === 'manager') return 'bi-briefcase-fill';
    if (role === 'supervisor') return 'bi-eye-fill';
    return 'bi-person-fill';
  }

  deleteUser(id: string, name?: string) {
    this.confirmModal.open({
      message: 'Êtes-vous sûr de vouloir supprimer cet utilisateur ?',
      itemName: name,
      onConfirm: () => {
        this.userService.deleteUser(id).subscribe({
          next: () => {
            this.users = this.users.filter((u) => u._id !== id);
            this.toast.success('Utilisateur supprimé avec succès.');
          },
          error: (e: any) => this.toast.error(e?.error?.message || 'Suppression impossible.'),
        });
      },
    });
  }
}