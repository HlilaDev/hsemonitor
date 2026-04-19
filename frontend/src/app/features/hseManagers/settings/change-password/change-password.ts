import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './change-password.html',
  styleUrl: './change-password.scss',
})
export class ChangePassword {
  currentPassword = signal('');
  newPassword = signal('');
  confirmPassword = signal('');

  showCurrentPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);

  submitted = signal(false);

  hasMinLength = computed(() => this.newPassword().length >= 8);
  hasUppercase = computed(() => /[A-Z]/.test(this.newPassword()));
  hasLowercase = computed(() => /[a-z]/.test(this.newPassword()));
  hasNumber = computed(() => /\d/.test(this.newPassword()));
  hasSpecialChar = computed(() => /[^A-Za-z0-9]/.test(this.newPassword()));

  passwordsMatch = computed(() => {
    const confirm = this.confirmPassword();
    return !!confirm && this.newPassword() === confirm;
  });

  passwordStrength = computed(() => {
    let score = 0;
    if (this.hasMinLength()) score++;
    if (this.hasUppercase()) score++;
    if (this.hasLowercase()) score++;
    if (this.hasNumber()) score++;
    if (this.hasSpecialChar()) score++;

    if (score <= 2) return 'weak';
    if (score <= 4) return 'medium';
    return 'strong';
  });

  passwordStrengthLabel = computed(() => {
    switch (this.passwordStrength()) {
      case 'weak':
        return 'Weak';
      case 'medium':
        return 'Medium';
      case 'strong':
        return 'Strong';
      default:
        return 'Weak';
    }
  });

  formValid = computed(() => {
    return (
      !!this.currentPassword().trim() &&
      !!this.newPassword().trim() &&
      !!this.confirmPassword().trim() &&
      this.hasMinLength() &&
      this.hasUppercase() &&
      this.hasLowercase() &&
      this.hasNumber() &&
      this.hasSpecialChar() &&
      this.passwordsMatch()
    );
  });

  toggleCurrentPassword(): void {
    this.showCurrentPassword.update((value) => !value);
  }

  toggleNewPassword(): void {
    this.showNewPassword.update((value) => !value);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update((value) => !value);
  }

  onSubmit(): void {
    this.submitted.set(true);

    if (!this.formValid()) return;

    console.log('Change password payload:', {
      currentPassword: this.currentPassword(),
      newPassword: this.newPassword(),
      confirmPassword: this.confirmPassword(),
    });

    // ici plus tard:
    // appeler ton service backend
    // this.accountService.changePassword({...}).subscribe(...)

    this.currentPassword.set('');
    this.newPassword.set('');
    this.confirmPassword.set('');
    this.submitted.set(false);
  }
}