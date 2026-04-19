import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { PpeAlertServices } from '../../../../core/services/ppeAlerts/ppe-alert-services';

type AlertStatus = 'open' | 'acknowledged' | 'resolved' | 'false_positive';
type AlertType = 'no_helmet' | 'no_vest' | 'zone_intrusion' | 'ppe_violation';

interface PpeAlertItem {
  _id: string;
  alertType: AlertType | string;
  label: string;
  confidence: number;
  cameraId?: string;
  siteId?: string;
  deviceId?: string;
  snapshotPath?: string;
  source?: string;
  status: AlertStatus | string;
  timestamp: string;
  createdAt?: string;
  updatedAt?: string;
  zone?: {
    _id?: string;
    name?: string;
    code?: string;
  } | null;
  device?: {
    _id?: string;
    name?: string;
    deviceId?: string;
    status?: string;
  } | null;
  metadata?: {
    trackId?: number | string | null;
    siteId?: string;
    zoneId?: string;
    cameraId?: string;
    eventType?: string;
    [key: string]: unknown;
  };
}

@Component({
  selector: 'app-ppe-alerts-overview',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './ppe-alerts-overview.html',
  styleUrl: './ppe-alerts-overview.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PpeAlertsOverview implements OnInit {
  private readonly ppeAlertServices = inject(PpeAlertServices);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly refreshing = signal(false);
  readonly error = signal<string | null>(null);
  readonly alerts = signal<PpeAlertItem[]>([]);

  readonly search = signal('');
  readonly selectedStatus = signal<'all' | AlertStatus>('all');
  readonly selectedType = signal<'all' | AlertType>('all');
  readonly selectedSort = signal<'newest' | 'oldest' | 'confidence'>('newest');

  readonly statusOptions: Array<{ label: string; value: 'all' | AlertStatus }> = [
    { label: 'Tous les statuts', value: 'all' },
    { label: 'Ouvert', value: 'open' },
    { label: 'Accusé', value: 'acknowledged' },
    { label: 'Résolu', value: 'resolved' },
    { label: 'Faux positif', value: 'false_positive' },
  ];

  readonly typeOptions: Array<{ label: string; value: 'all' | AlertType }> = [
    { label: 'Tous les types', value: 'all' },
    { label: 'Sans casque', value: 'no_helmet' },
    { label: 'Sans gilet', value: 'no_vest' },
    { label: 'Intrusion zone', value: 'zone_intrusion' },
    { label: 'Violation PPE', value: 'ppe_violation' },
  ];

  readonly filteredAlerts = computed(() => {
    const term = this.search().trim().toLowerCase();
    const status = this.selectedStatus();
    const type = this.selectedType();
    const sort = this.selectedSort();

    let items = [...this.alerts()];

    if (status !== 'all') {
      items = items.filter((item) => item.status === status);
    }

    if (type !== 'all') {
      items = items.filter((item) => item.alertType === type);
    }

    if (term) {
      items = items.filter((item) => {
        const text = [
          item.label,
          item.alertType,
          item.status,
          item.cameraId,
          item.siteId,
          item.deviceId,
          item.device?.name,
          item.device?.deviceId,
          item.zone?.name,
          item.zone?.code,
          item.source,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return text.includes(term);
      });
    }

    if (sort === 'newest') {
      items.sort(
        (a, b) =>
          new Date(b.timestamp || b.createdAt || '').getTime() -
          new Date(a.timestamp || a.createdAt || '').getTime()
      );
    }

    if (sort === 'oldest') {
      items.sort(
        (a, b) =>
          new Date(a.timestamp || a.createdAt || '').getTime() -
          new Date(b.timestamp || b.createdAt || '').getTime()
      );
    }

    if (sort === 'confidence') {
      items.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
    }

    return items;
  });

  readonly stats = computed(() => {
    const items = this.alerts();

    return {
      total: items.length,
      open: items.filter((item) => item.status === 'open').length,
      acknowledged: items.filter((item) => item.status === 'acknowledged').length,
      resolved: items.filter((item) => item.status === 'resolved').length,
      noHelmet: items.filter((item) => item.alertType === 'no_helmet').length,
    };
  });

  ngOnInit(): void {
    this.loadAlerts();
  }

  loadAlerts(isRefresh = false): void {
    this.error.set(null);

    if (isRefresh) {
      this.refreshing.set(true);
    } else {
      this.loading.set(true);
    }

    this.ppeAlertServices
      .getAll()
      .pipe(
        finalize(() => {
          this.loading.set(false);
          this.refreshing.set(false);
        })
      )
      .subscribe({
        next: (response: any) => {
          const items = Array.isArray(response)
            ? response
            : response?.alerts || response?.items || response?.data || [];

          this.alerts.set(items);
        },
        error: (err) => {
          console.error('Failed to load PPE alerts', err);
          this.error.set('Impossible de charger les alertes PPE.');
        },
      });
  }

  onSearchChange(value: string): void {
    this.search.set(value);
  }

  onStatusChange(value: string): void {
    this.selectedStatus.set(value as 'all' | AlertStatus);
  }

  onTypeChange(value: string): void {
    this.selectedType.set(value as 'all' | AlertType);
  }

  onSortChange(value: string): void {
    this.selectedSort.set(value as 'newest' | 'oldest' | 'confidence');
  }

  clearFilters(): void {
    this.search.set('');
    this.selectedStatus.set('all');
    this.selectedType.set('all');
    this.selectedSort.set('newest');
  }

  openDetails(alert: PpeAlertItem): void {
    this.router.navigate(['/manager/ppe', alert._id]);
  }

  markAs(alert: PpeAlertItem, status: AlertStatus): void {
    if (alert.status === status) return;

    this.ppeAlertServices.updateStatus(alert._id, { status }).subscribe({
      next: (response: any) => {
        const updated = response?.alert || response?.data || response;

        this.alerts.update((items) =>
          items.map((item) =>
            item._id === alert._id
              ? {
                  ...item,
                  ...(updated || {}),
                  status,
                }
              : item
          )
        );
      },
      error: (err) => {
        console.error('Failed to update PPE alert status', err);
      },
    });
  }

  trackById(_: number, item: PpeAlertItem): string {
    return item._id;
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'no_helmet':
        return 'Sans casque';
      case 'no_vest':
        return 'Sans gilet';
      case 'zone_intrusion':
        return 'Intrusion zone';
      case 'ppe_violation':
        return 'Violation PPE';
      default:
        return type || 'Inconnu';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'open':
        return 'Ouvert';
      case 'acknowledged':
        return 'Accusé';
      case 'resolved':
        return 'Résolu';
      case 'false_positive':
        return 'Faux positif';
      default:
        return status || 'Inconnu';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'open':
        return 'status-open';
      case 'acknowledged':
        return 'status-acknowledged';
      case 'resolved':
        return 'status-resolved';
      case 'false_positive':
        return 'status-false-positive';
      default:
        return 'status-default';
    }
  }

  getTypeClass(type: string): string {
    switch (type) {
      case 'no_helmet':
        return 'type-critical';
      case 'no_vest':
        return 'type-warning';
      case 'zone_intrusion':
        return 'type-critical';
      default:
        return 'type-default';
    }
  }

  getConfidencePercent(confidence: number): number {
    return Math.max(0, Math.min(100, Math.round((confidence || 0) * 100)));
  }

  getPreviewUrl(alert: PpeAlertItem): string | null {
    return alert.snapshotPath || null;
  }
}