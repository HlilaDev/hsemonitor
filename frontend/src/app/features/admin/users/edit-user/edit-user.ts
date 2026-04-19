import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormControl,
  FormGroup,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { UserServices, User } from '../../../../core/services/users/user-services';

type Role = 'operator' | 'hseManager' | 'admin';

type EditUserForm = FormGroup<{
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  email: FormControl<string>;
  role: FormControl<Role>;
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
}>;

// ✅ validator password match
function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value as string;
  const confirm = group.get('confirmPassword')?.value as string;

  // if both empty => ok (password optional)
  if (!password && !confirm) return null;

  // if one empty => error
  if (!!password && !confirm) return { passwordMismatch: true };
  if (!password && !!confirm) return { passwordMismatch: true };

  return password === confirm ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './edit-user.html',
  styleUrl: './edit-user.scss',
})
export class EditUser {
  private fb = inject(FormBuilder);
  private userService = inject(UserServices);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  id = '';
  loadingUser = true;
  saving = false;

  errorMessage = '';
  successMessage = '';

  form: EditUserForm = this.fb.nonNullable.group(
    {
      firstName: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(2)]),
      lastName: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(2)]),
      email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
      role: this.fb.nonNullable.control<Role>('operator', [Validators.required]),
      password: this.fb.nonNullable.control('', []), // optional
      confirmPassword: this.fb.nonNullable.control('', []), // optional
    },
    { validators: passwordMatchValidator }
  ) as EditUserForm;

  get firstName() { return this.form.controls.firstName; }
  get lastName() { return this.form.controls.lastName; }
  get email() { return this.form.controls.email; }
  get password() { return this.form.controls.password; }
  get confirmPassword() { return this.form.controls.confirmPassword; }

  constructor() {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    this.loadUser();
  }

  loadUser() {
    if (!this.id) {
      this.loadingUser = false;
      this.errorMessage = 'Missing user id';
      return;
    }

    this.loadingUser = true;
    this.errorMessage = '';

    this.userService.getUserById(this.id).subscribe({
      next: (u: any) => {
        const user: User = u?.user ?? u; // support if backend wraps
        this.form.patchValue({
          firstName: user.firstName ?? '',
          lastName: user.lastName ?? '',
          email: user.email ?? '',
          role: (user.role as Role) ?? 'operator',
          password: '',
          confirmPassword: '',
        });
        this.loadingUser = false;
      },
      error: (e: any) => {
        this.errorMessage = e?.message || 'Failed to load user';
        this.loadingUser = false;
      },
    });
  }

  submit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;

    const v = this.form.getRawValue();

    const payload: any = {
      firstName: v.firstName.trim(),
      lastName: v.lastName.trim(),
      email: v.email.trim().toLowerCase(),
      role: v.role,
    };

    // ✅ send password only if filled
    if (v.password && v.password.trim().length > 0) {
      payload.password = v.password;
    }

    this.userService.updateUser(this.id, payload).subscribe({
      next: () => {
        this.saving = false;
        this.successMessage = 'Utilisateur modifié avec succès ✅';
        setTimeout(() => this.router.navigateByUrl('/admin/users'), 600);
      },
      error: (e: any) => {
        this.saving = false;
        this.errorMessage = e?.message || 'Erreur lors de la mise à jour';
      },
    });
  }

  resetPasswords() {
    this.form.patchValue({ password: '', confirmPassword: '' });
    this.form.updateValueAndValidity();
  }

  // for template
  get passwordMismatch(): boolean {
    return this.form.hasError('passwordMismatch') &&
      (this.password.touched || this.confirmPassword.touched);
  }
}