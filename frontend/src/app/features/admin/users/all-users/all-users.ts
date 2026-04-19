import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';

import { UserServices } from '../../../../core/services/users/user-services';

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
  imports: [CommonModule, RouterModule, DatePipe],
  templateUrl: './all-users.html',
  styleUrl: './all-users.scss',
})
export class AllUsers {
  private userService = inject(UserServices);

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

  deleteUser(id: string) {
    if (!confirm('Confirmer la suppression ?')) return;

    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.users = this.users.filter((u) => u._id !== id);
      },
      error: (e: any) => alert(e?.message || 'Suppression impossible'),
    });
  }
}