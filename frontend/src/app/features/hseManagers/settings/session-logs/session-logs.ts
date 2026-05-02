import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  SessionLogServices,
  SessionLogItem,
  SessionStatus,
  DeviceType,
} from '../../../../core/services/session-logs/session-log-services';

@Component({
  selector: 'app-session-logs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './session-logs.html',
  styleUrl: './session-logs.scss',
})
export class SessionLogs implements OnInit {
  private sessionLogService = inject(SessionLogServices);

  // UI state
  search = signal('');
  selectedStatus = signal<'all' | SessionStatus>('all');
  loading = signal(false);
  errorMessage = signal('');

  // data
  sessions = signal<SessionLogItem[]>([]);

  ngOnInit(): void {
    this.loadLogs();
  }

  // 🔥 IMPORTANT : no fake "current" logic here
  loadLogs(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.sessionLogService.getLogs().subscribe({
      next: (res) => {
        this.sessions.set(res.logs || []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Session logs error:', err);
        this.errorMessage.set('Failed to load session logs');
        this.loading.set(false);
      },
    });
  }

  // filters
  filteredSessions = computed(() => {
    const q = this.search().trim().toLowerCase();
    const status = this.selectedStatus();

    return this.sessions().filter((item) => {
      const matchesSearch =
        !q ||
        item.deviceName?.toLowerCase().includes(q) ||
        item.browser?.toLowerCase().includes(q) ||
        item.ipAddress?.toLowerCase().includes(q) ||
        item.location?.toLowerCase().includes(q);

      const matchesStatus = status === 'all' || item.status === status;

      return matchesSearch && matchesStatus;
    });
  });

  // stats
  totalSessions = computed(() => this.sessions().length);

  successCount = computed(() =>
    this.sessions().filter((item) => item.status === 'success').length
  );

  failedCount = computed(() =>
    this.sessions().filter((item) => item.status === 'failed').length
  );

  expiredCount = computed(() =>
    this.sessions().filter((item) => item.status === 'expired').length
  );

  // helpers
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