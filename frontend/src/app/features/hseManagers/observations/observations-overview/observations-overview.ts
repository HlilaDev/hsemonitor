import { CommonModule, DatePipe, NgClass } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import {
  ObservationService,
  Observation,
  ObservationSeverity,
  ObservationStatus,
} from '../../../../core/services/observations/observation-services';

type ObservationItem = {
  _id: string;
  title: string;
  description: string;
  zone: string;
  severity: ObservationSeverity;
  status: ObservationStatus;
  createdAt: string;
  imagesCount: number;
  agentName: string;
};

@Component({
  selector: 'app-observations-overview',
  standalone: true,
  imports: [CommonModule, FormsModule, NgClass, DatePipe],
  templateUrl: './observations-overview.html',
  styleUrl: './observations-overview.scss',
})
export class ObservationsOverview {
  private observationService = inject(ObservationService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  loading = signal(false);
  error = signal('');

  search = signal('');
  selectedStatus = signal<'all' | ObservationStatus>('all');
  selectedSeverity = signal<'all' | ObservationSeverity>('all');
  selectedZone = signal('all');

  observations = signal<ObservationItem[]>([]);

  constructor() {
    this.loadObservations();
  }

  loadObservations(): void {
    this.loading.set(true);
    this.error.set('');

    const sub = this.observationService
      .list()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response: any) => {
          const rawItems: Observation[] = Array.isArray(response)
            ? response
            : response?.items || response?.data || response?.observations || [];

          const mapped = rawItems.map((item) => this.mapObservation(item));
          this.observations.set(mapped);
        },
        error: (err) => {
          console.error(err);
          this.error.set(
            err?.error?.message || 'Impossible de charger les observations.'
          );
          this.observations.set([]);
        },
      });

    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  mapObservation(item: Observation): ObservationItem {
    return {
      _id: item._id,
      title: item.title,
      description: item.description,
      zone:
        typeof item.zone === 'string'
          ? item.zone
          : item.zone?.name || '-',
      severity: item.severity,
      status: item.status,
      createdAt: item.createdAt,
      imagesCount: item.images?.length || 0,
      agentName:
        typeof item.reportedBy === 'string'
          ? item.reportedBy
          : item.reportedBy?.fullName ||
            item.reportedBy?.name ||
            item.reportedBy?.email ||
            '-',
    };
  }

  zones = computed(() => {
    const allZones = this.observations()
      .map((item) => item.zone)
      .filter(Boolean);

    return ['all', ...new Set(allZones)];
  });

  filteredObservations = computed(() => {
    const q = this.search().trim().toLowerCase();
    const status = this.selectedStatus();
    const severity = this.selectedSeverity();
    const zone = this.selectedZone();

    return this.observations().filter((item) => {
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.zone.toLowerCase().includes(q) ||
        item.agentName.toLowerCase().includes(q);

      const matchesStatus = status === 'all' ? true : item.status === status;
      const matchesSeverity = severity === 'all' ? true : item.severity === severity;
      const matchesZone = zone === 'all' ? true : item.zone === zone;

      return matchesSearch && matchesStatus && matchesSeverity && matchesZone;
    });
  });

  stats = computed(() => {
    const items = this.observations();

    return {
      total: items.length,
      open: items.filter((i) => i.status === 'open').length,
      critical: items.filter((i) => i.severity === 'critical').length,
      closed: items.filter((i) => i.status === 'closed').length,
    };
  });

  trackById(index: number, item: ObservationItem): string {
    return item._id;
  }

  refresh(): void {
    this.loadObservations();
  }

  viewDetails(item: ObservationItem): void {
    this.router.navigate(['/manager/observations', item._id]);
  }

  getSeverityLabel(severity: ObservationSeverity): string {
    switch (severity) {
      case 'low':
        return 'Faible';
      case 'medium':
        return 'Moyenne';
      case 'high':
        return 'Élevée';
      case 'critical':
        return 'Critique';
      default:
        return severity;
    }
  }

  getStatusLabel(status: ObservationStatus): string {
    switch (status) {
      case 'open':
        return 'Ouverte';
      case 'in_progress':
        return 'En cours';
      case 'closed':
        return 'Clôturée';
      default:
        return status;
    }
  }
}