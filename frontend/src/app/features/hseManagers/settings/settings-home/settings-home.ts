import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

interface SettingsSection {
  key: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  badge?: string;
}

interface ActivityItem {
  title: string;
  description: string;
  time: string;
  type: 'security' | 'profile' | 'system';
}

@Component({
  selector: 'app-settings-home',
  standalone: true,
  imports: [CommonModule,RouterLink],
  templateUrl: './settings-home.html',
  styleUrl: './settings-home.scss',
})
export class SettingsHome {
  securityScore = signal(82);

  sections = signal<SettingsSection[]>([
    {
      key: 'profile',
      title: 'Profile Settings',
      description: 'Manage your personal information, contact details and profile picture.',
      icon: 'bi-person-gear',
      route: '/manager/settings/profile',
    },
    {
      key: 'security',
      title: 'Account Security',
      description: 'Review account protection, security status and access options.',
      icon: 'bi-shield-lock',
      route: '/manager/settings/security',
      badge: 'Important',
    },
    {
      key: 'password',
      title: 'Change Password',
      description: 'Update your password regularly to keep your account secure.',
      icon: 'bi-key',
      route: '/manager/settings/change-password',
    },
    {
      key: 'logs',
      title: 'Session Logs',
      description: 'Track recent logins, devices, browsers and account activity.',
      icon: 'bi-clock-history',
      route: '/manager/settings/logs',
    },
    {
      key: 'notifications',
      title: 'Notification Settings',
      description: 'Control alert preferences for incidents, observations and reports.',
      icon: 'bi-bell',
      route: '/manager/settings/notifications',
    },
    {
      key: 'appearance',
      title: 'Appearance',
      description: 'Customize theme, interface style and display preferences.',
      icon: 'bi-palette',
      route: '/manager/settings/appearance',
    },
  ]);

  activities = signal<ActivityItem[]>([
    {
      title: 'Password updated',
      description: 'Your password was changed successfully.',
      time: 'Today, 09:42',
      type: 'security',
    },
    {
      title: 'New login detected',
      description: 'Chrome on Windows accessed your account from Tunis.',
      time: 'Today, 08:15',
      type: 'security',
    },
    {
      title: 'Profile information edited',
      description: 'Phone number and emergency contact were updated.',
      time: 'Yesterday',
      type: 'profile',
    },
    {
      title: 'Notification preferences changed',
      description: 'Critical incident alerts were enabled by email.',
      time: '2 days ago',
      type: 'system',
    },
  ]);

  twoFactorEnabled = signal(false);
  emailAlertsEnabled = signal(true);
  darkModeEnabled = signal(false);

  securityLabel = computed(() => {
    const score = this.securityScore();
    if (score >= 85) return 'Strong';
    if (score >= 65) return 'Good';
    return 'Needs attention';
  });

  securityMessage = computed(() => {
    if (!this.twoFactorEnabled()) {
      return 'Enable extra protection like two-factor authentication to improve account safety.';
    }
    return 'Your account protection is in good condition.';
  });

  getActivityIcon(type: ActivityItem['type']): string {
    switch (type) {
      case 'security':
        return 'bi-shield-check';
      case 'profile':
        return 'bi-person-check';
      case 'system':
        return 'bi-gear';
      default:
        return 'bi-circle';
    }
  }

  getActivityClass(type: ActivityItem['type']): string {
    return type;
  }

  toggleEmailAlerts(): void {
    this.emailAlertsEnabled.update((value) => !value);
  }

  toggleDarkMode(): void {
    this.darkModeEnabled.update((value) => !value);
  }

  toggleTwoFactor(): void {
    this.twoFactorEnabled.update((value) => !value);
    this.securityScore.set(this.twoFactorEnabled() ? 82 : 92);
  }

  trackBySection(index: number, item: SettingsSection): string {
    return item.key;
  }

  trackByActivity(index: number, item: ActivityItem): string {
    return `${item.title}-${item.time}`;
  }
}