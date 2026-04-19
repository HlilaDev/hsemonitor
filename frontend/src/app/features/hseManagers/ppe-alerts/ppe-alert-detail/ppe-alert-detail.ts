import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

import { PpeAlertServices } from '../../../../core/services/ppeAlerts/ppe-alert-services';

type PpeAlertStatus =
  | 'open'
  | 'acknowledged'
  | 'resolved'
  | 'false_positive';

interface PpeAlertItem {
  _id: string;
  alertType: string;
  label: string;
  confidence: number;
  cameraId?: string;
  siteId?: string;
  deviceId?: string;
  snapshotPath?: string;
  source?: string;
  status: PpeAlertStatus;
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
  } | null;
}

@Component({
  selector: 'app-ppe-alert-detail',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './ppe-alert-detail.html',
  styleUrl: './ppe-alert-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PpeAlertDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(PpeAlertServices);

  readonly loading = signal(true);
  readonly actionLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly alert = signal<PpeAlertItem | null>(null);

  readonly confidencePercent = computed(() =>
    this.getConfidencePercent(this.alert()?.confidence || 0)
  );

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error.set('ID invalide');
      this.loading.set(false);
      return;
    }

    this.service.getById(id).subscribe({
      next: (res: any) => {
        const data = (res?.alert || res?.data || res) as PpeAlertItem;
        this.alert.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement détail PPE alert', err);
        this.error.set('Erreur lors du chargement de l’alerte.');
        this.loading.set(false);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/manager/ppe-alerts']);
  }

  updateStatus(status: PpeAlertStatus): void {
    const currentAlert = this.alert();
    if (!currentAlert?._id || this.actionLoading()) return;

    this.actionLoading.set(true);

    this.service.updateStatus(currentAlert._id, { status }).subscribe({
      next: (res: any) => {
        const updated = (res?.alert || res?.data || res) as Partial<PpeAlertItem>;

        this.alert.update((current) => {
          if (!current) return current;

          return {
            ...current,
            ...updated,
            status,
          };
        });

        this.actionLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur update status PPE alert', err);
        this.actionLoading.set(false);
      },
    });
  }

  getSnapshotUrl(path: string | undefined): string {
  if (!path) return '';
  return `${environment.apiBaseUrl}${path}`;
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

  getConfidencePercent(value: number): number {
    return Math.max(0, Math.min(100, Math.round((value || 0) * 100)));
  }
}