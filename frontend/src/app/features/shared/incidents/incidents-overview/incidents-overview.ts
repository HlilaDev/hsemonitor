import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  IncidentEvent,
  IncidentEventServices,
  IncidentSeverity,
  IncidentStatus,
} from '../../../../core/services/incidentEvents/incident-event-services';

type IncidentFilter = 'all' | IncidentStatus;

interface ZoneRisk {
  zone: string;
  incidents: number;
  risk: 'stable' | 'warning' | 'critical';
}

interface ActivityItem {
  time: string;
  text: string;
  type: 'create' | 'update' | 'resolve';
}

@Component({
  selector: 'app-incidents-overview',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './incidents-overview.html',
  styleUrl: './incidents-overview.scss',
})
export class IncidentsOverview implements OnInit {
  private incidentService = inject(IncidentEventServices);

  selectedFilter = signal<IncidentFilter>('all');

  isLoading = signal(false);
  error = signal<string | null>(null);

  incidents = signal<IncidentEvent[]>([]);

  filteredIncidents = computed(() => {
    const filter = this.selectedFilter();

    if (filter === 'all') {
      return this.incidents();
    }

    return this.incidents().filter((incident) => incident.status === filter);
  });

  totalIncidents = computed(() => this.incidents().length);

  openCount = computed(() =>
    this.incidents().filter((incident) => incident.status === 'open').length
  );

  investigatingCount = computed(() =>
    this.incidents().filter((incident) =>
      ['reviewed', 'in_progress'].includes(incident.status)
    ).length
  );

  resolvedCount = computed(() =>
    this.incidents().filter((incident) =>
      ['closed', 'false_positive'].includes(incident.status)
    ).length
  );

  criticalCount = computed(() =>
    this.incidents().filter((incident) => incident.severity === 'critical')
      .length
  );

riskZones = computed<ZoneRisk[]>(() => {
  const map = new Map<string, number>();

  for (const incident of this.incidents()) {
    const zone = this.getZoneName(incident.zone);
    map.set(zone, (map.get(zone) || 0) + 1);
  }

  return Array.from(map.entries())
    .map(([zone, incidents]): ZoneRisk => {
      const risk: ZoneRisk['risk'] =
        incidents >= 5 ? 'critical' : incidents >= 2 ? 'warning' : 'stable';

      return {
        zone,
        incidents,
        risk,
      };
    })
    .sort((a, b) => b.incidents - a.incidents)
    .slice(0, 5);
});

  activities = computed<ActivityItem[]>(() => {
    return this.incidents()
      .slice(0, 6)
      .map((incident) => {
        const status = incident.status;

        return {
          time: this.formatTime(incident.updatedAt || incident.createdAt),
          text: `${incident.title} — ${this.statusLabel(status)}`,
          type:
            status === 'closed' || status === 'false_positive'
              ? 'resolve'
              : status === 'open'
              ? 'create'
              : 'update',
        };
      });
  });

  ngOnInit(): void {
    this.loadIncidents();
  }

  loadIncidents(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.incidentService
      .listIncidentEvents({
        page: 1,
        limit: 50,
        sort: '-createdAt',
      })
      .subscribe({
        next: (res) => {
          this.incidents.set(res.items || []);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set(
            err?.error?.message || 'Impossible de charger les incidents.'
          );
          this.isLoading.set(false);
        },
      });
  }

  setFilter(filter: IncidentFilter): void {
    this.selectedFilter.set(filter);
  }

  severityLabel(value?: IncidentSeverity): string {
    switch (value) {
      case 'low':
        return 'Faible';
      case 'medium':
        return 'Moyenne';
      case 'high':
        return 'Élevée';
      case 'critical':
        return 'Critique';
      default:
        return 'Non définie';
    }
  }

  statusLabel(value?: IncidentStatus): string {
    switch (value) {
      case 'open':
        return 'Ouvert';
      case 'reviewed':
        return 'Révisé';
      case 'in_progress':
        return 'En cours';
      case 'closed':
        return 'Clôturé';
      case 'false_positive':
        return 'Faux positif';
      default:
        return 'Inconnu';
    }
  }

  riskLabel(value: ZoneRisk['risk']): string {
    switch (value) {
      case 'stable':
        return 'Stable';
      case 'warning':
        return 'Attention';
      case 'critical':
        return 'Critique';
      default:
        return value;
    }
  }

  typeLabel(type?: string): string {
    switch (type) {
      case 'FALL':
        return 'Chute';
      case 'INJURY':
        return 'Blessure';
      case 'FIRE_ALERT':
        return 'Incendie';
      case 'LEAK':
        return 'Fuite';
      case 'WORK_ACCIDENT':
        return 'Accident de travail';
      case 'NO_HELMET':
        return 'Casque absent';
      case 'NO_VEST':
        return 'Gilet absent';
      case 'GAS_ALERT':
        return 'Alerte gaz';
      case 'TEMP_ALERT':
        return 'Alerte température';
      case 'MANUAL_REPORT':
        return 'Signalement manuel';
      default:
        return type || 'Autre';
    }
  }

  getZoneName(zone: any): string {
    if (!zone) return 'Zone non définie';
    if (typeof zone === 'string') return zone;
    return zone.name || zone.label || 'Zone non définie';
  }

  getReportedBy(incident: IncidentEvent): string {
    const user = incident.reportedBy;

    if (!user) return 'Non assigné';
    if (typeof user === 'string') return user;

    return (
      user.fullName ||
      `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
      user.email ||
      'Non assigné'
    );
  }

  formatDate(value?: string): string {
    if (!value) return '—';

    return new Date(value).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatTime(value?: string): string {
    if (!value) return '—';

    return new Date(value).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}