import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';

interface SecurityItem {
  key: string;
  title: string;
  description: string;
  status: 'good' | 'warning' | 'inactive';
  icon: string;
  actionLabel: string;
}

interface LoginActivity {
  title: string;
  device: string;
  location: string;
  time: string;
  status: 'success' | 'failed';
}

@Component({
  selector: 'app-account-security',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './account-security.html',
  styleUrl: './account-security.scss',
})
export class AccountSecurity {
  twoFactorEnabled = signal(false);
  loginAlertsEnabled = signal(true);
  suspiciousActivityProtection = signal(true);

  protections = signal<SecurityItem[]>([
    {
      key: 'password',
      title: 'Password Protection',
      description: 'Your password was updated recently and meets strong security requirements.',
      status: 'good',
      icon: 'bi-key',
      actionLabel: 'Managed',
    },
    {
      key: 'twoFactor',
      title: 'Two-Factor Authentication',
      description: 'Add an extra verification step to better protect your account.',
      status: 'warning',
      icon: 'bi-shield-lock',
      actionLabel: 'Enable',
    },
    {
      key: 'recovery',
      title: 'Recovery Options',
      description: 'Recovery email and backup verification options are not fully configured.',
      status: 'warning',
      icon: 'bi-envelope-check',
      actionLabel: 'Review',
    },
    {
      key: 'sessions',
      title: 'Active Sessions',
      description: 'Monitor connected devices, browsers and current access sessions.',
      status: 'good',
      icon: 'bi-pc-display-horizontal',
      actionLabel: 'Open',
    },
  ]);

  recentActivity = signal<LoginActivity[]>([
    {
      title: 'Successful login',
      device: 'Chrome on Windows',
      location: 'Tunis, Tunisia',
      time: 'Today, 08:15',
      status: 'success',
    },
    {
      title: 'Failed login attempt',
      device: 'Unknown browser',
      location: 'Unknown location',
      time: 'Yesterday, 22:31',
      status: 'failed',
    },
    {
      title: 'Successful login',
      device: 'Mobile Chrome on Android',
      location: 'Sousse, Tunisia',
      time: 'Yesterday, 09:10',
      status: 'success',
    },
  ]);

  securityScore = computed(() => {
    let score = 55;
    if (this.twoFactorEnabled()) score += 20;
    if (this.loginAlertsEnabled()) score += 10;
    if (this.suspiciousActivityProtection()) score += 15;
    return Math.min(score, 100);
  });

  securityLevel = computed(() => {
    const score = this.securityScore();
    if (score >= 85) return 'Strong';
    if (score >= 65) return 'Good';
    return 'Needs Attention';
  });

  getProtectionClass(status: SecurityItem['status']): string {
    return status;
  }

  getActivityClass(status: LoginActivity['status']): string {
    return status;
  }

  toggleTwoFactor(): void {
    this.twoFactorEnabled.update((value) => !value);
  }

  toggleLoginAlerts(): void {
    this.loginAlertsEnabled.update((value) => !value);
  }

  toggleSuspiciousProtection(): void {
    this.suspiciousActivityProtection.update((value) => !value);
  }

  trackByKey(index: number, item: SecurityItem): string {
    return item.key;
  }

  trackByActivity(index: number, item: LoginActivity): string {
    return `${item.title}-${item.time}`;
  }
}