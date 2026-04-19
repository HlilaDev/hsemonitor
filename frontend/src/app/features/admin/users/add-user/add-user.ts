import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { UserServices } from '../../../../core/services/users/user-services';

type Role = 'agent' | 'manager' | 'admin';

type AddUserForm = FormGroup<{
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
  role: FormControl<Role>;
}>;

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './add-user.html',
  styleUrl: './add-user.scss',
})
export class AddUser {
  private fb = inject(FormBuilder);
  private userService = inject(UserServices);
  private router = inject(Router);

  loading = false;
  errorMessage = '';
  successMessage = '';

  form: AddUserForm = this.fb.nonNullable.group({
    firstName: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(2)]),
    lastName: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(2)]),
    email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
    password: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(6)]),
    role: this.fb.nonNullable.control<Role>('agent', [Validators.required]),
  }) as AddUserForm;

  get firstName() { return this.form.controls.firstName; }
  get lastName() { return this.form.controls.lastName; }
  get email() { return this.form.controls.email; }
  get password() { return this.form.controls.password; }

  submit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    const v = this.form.getRawValue();
    const payload = {
      firstName: v.firstName.trim(),
      lastName: v.lastName.trim(),
      email: v.email.trim().toLowerCase(),
      password: v.password, // backend will hash
      role: v.role,
    };

    this.userService.addUser(payload).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Utilisateur créé avec succès ✅';
        setTimeout(() => this.router.navigateByUrl('/admin/users'), 600);
      },
      error: (e: any) => {
        this.loading = false;
        this.errorMessage = e?.message || 'Erreur lors de la création de l’utilisateur';
      },
    });
  }

  reset() {
    this.form.reset({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'agent',
    });
  }
}