import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthServices } from '../../../core/services/auth/auth-services';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';
  showPassword = false;
  rememberMe = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthServices,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]],
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.auth.login(this.loginForm.value).subscribe({
      next: (res: any) => {
        this.loading = false;

        const role = res?.user?.role || res?.role;

        if (role === 'admin') {
          this.router.navigateByUrl('/admin');
        } else if (role === 'superAdmin') {
          this.router.navigateByUrl('/super');
        } else if (role === 'supervisor') {
          this.router.navigateByUrl('/supervisor');
        } else if (role === 'manager') {
          this.router.navigateByUrl('/manager');
        } else if (role === 'agent') {
          this.router.navigateByUrl('/agent');
        } else {
          this.errorMessage = 'Role not recognized';
          this.router.navigateByUrl('/');
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage =
          err?.error?.message || 'Email or password incorrect';
      },
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}