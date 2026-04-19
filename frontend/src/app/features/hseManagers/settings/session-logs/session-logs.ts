import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

type SessionStatus = 'success' | 'failed' | 'expired';
type DeviceType = 'desktop' | 'mobile' | 'tablet';

interface SessionLogItem {
  _id: string;
  deviceName: string;
  browser: string;
  ipAddress: string;
  location: string;
  status: SessionStatus;
  deviceType: DeviceType;
  loginAt: string;
  lastActivity: string;
  current: boolean;
}

@Component({
  selector: 'app-session-logs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './session-logs.html',
  styleUrl: './session-logs.scss',
})
export class SessionLogs {
  search = signal('');
  selectedStatus = signal<'all' | SessionStatus>('all');

  sessions = signal<SessionLogItem[]>([
    {
      _id: 'LOG-001',
      deviceName: 'Windows Workstation',
      browser: 'Chrome 134',
      ipAddress: '196.203.18.25',
      location: 'Tunis, Tunisia',
      status: 'success',
      deviceType: 'desktop',
      loginAt: 'Today, 08:15',
      lastActivity: '2 min ago',
      current: true,
    },
    {
      _id: 'LOG-002',
      deviceName: 'Office Laptop',
      browser: 'Edge 133',
      ipAddress: '41.231.72.14',
      location: 'Sfax, Tunisia',
      status: 'success',
      deviceType: 'desktop',
      loginAt: 'Yesterday, 17:42',
      lastActivity: 'Yesterday, 18:10',
      current: false,
    },
    {
      _id: 'LOG-003',
      deviceName: 'Android Phone',
      browser: 'Mobile Chrome',
      ipAddress: '154.121.44.8',
      location: 'Sousse, Tunisia',
      status: 'expired',
      deviceType: 'mobile',
      loginAt: 'Yesterday, 09:20',
      lastActivity: 'Yesterday, 10:02',
      current: false,
    },
    {
      _id: 'LOG-004',
      deviceName: 'Unknown Device',
      browser: 'Firefox',
      ipAddress: '102.15.66.200',
      location: 'Unknown location',
      status: 'failed',
      deviceType: 'desktop',
      loginAt: '2 days ago, 22:31',
      lastActivity: 'Attempt blocked',
      current: false,
    },
    {
      _id: 'LOG-005',
      deviceName: 'iPad Pro',
      browser: 'Safari',
      ipAddress: '197.13.55.119',
      location: 'Nabeul, Tunisia',
      status: 'success',
      deviceType: 'tablet',
      loginAt: '3 days ago, 11:08',
      lastActivity: '3 days ago, 11:40',
      current: false,
    },
    {
      _id: 'LOG-006',
      deviceName: 'Android Phone',
      browser: 'Samsung Internet',
      ipAddress: '197.27.144.17',
      location: 'Gabes, Tunisia',
      status: 'failed',
      deviceType: 'mobile',
      loginAt: '5 days ago, 07:56',
      lastActivity: 'Wrong password',
      current: false,
    },
  ]);

  filteredSessions = computed(() => {
    const q = this.search().trim().toLowerCase();
    const status = this.selectedStatus();

    return this.sessions().filter((item) => {
      const matchesSearch =
        !q ||
        item.deviceName.toLowerCase().includes(q) ||
        item.browser.toLowerCase().includes(q) ||
        item.ipAddress.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q);

      const matchesStatus = status === 'all' || item.status === status;

      return matchesSearch && matchesStatus;
    });
  });

  totalSessions = computed(() => this.sessions().length);
  successCount = computed(() => this.sessions().filter((item) => item.status === 'success').length);
  failedCount = computed(() => this.sessions().filter((item) => item.status === 'failed').length);
  expiredCount = computed(() => this.sessions().filter((item) => item.status === 'expired').length);

  getStatusLabel(status: SessionStatus): string {
    switch (status) {
      case 'success':
        return 'Success';
      case 'failed':
        return 'Failed';
      case 'expired':
        return 'Expired';
      default:
        return status;
    }
  }

  getDeviceIcon(type: DeviceType): string {
    switch (type) {
      case 'desktop':
        return 'bi-pc-display-horizontal';
      case 'mobile':
        return 'bi-phone';
      case 'tablet':
        return 'bi-tablet';
      default:
        return 'bi-laptop';
    }
  }

  trackById(index: number, item: SessionLogItem): string {
    return item._id;
  }
}