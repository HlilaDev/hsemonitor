import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  IncidentEvent,
  IncidentEventServices,
  IncidentSeverity,
  IncidentStatus,
} from '../../../../core/services/incidentEvents/incident-event-services';

import {
  IncidentStats,
  IncidentsStatsServices,
} from '../../../../core/services/stats/incidents-stats/incidents-stats-services';

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
  private incidentsStatsService = inject(IncidentsStatsServices);

  selectedFilter = signal<IncidentFilter>('all');

  isLoading = signal(false);
  isStatsLoading = signal(false);
  error = signal<string | null>(null);

  incidents = signal<IncidentEvent[]>([]);
  stats = signal<IncidentStats | null>(null);

  filteredIncidents = computed(() => {
    const filter = this.selectedFilter();
    if (filter === 'all') return this.incidents();
    return this.incidents().filter((incident) => incident.status === filter);
  });

  totalIncidents = computed(() => this.stats()?.total ?? 0);
  openCount = computed(() => this.stats()?.open?.count ?? 0);

  investigatingCount = computed(() => {
    return (
      this.stats()?.byStatus?.find((item) => item.status === 'in_progress')
        ?.count ?? 0
    );
  });

  resolvedCount = computed(() => this.stats()?.closed?.count ?? 0);

  criticalCount = computed(() => {
    return (
      this.stats()?.bySeverity?.find((item) => item.severity === 'critical')
        ?.count ?? 0
    );
  });

  weeklyTrend = computed(() => {
    const current = this.stats()?.weekly?.current ?? 0;
    const previous = this.stats()?.weekly?.previous ?? 0;
    return this.calcTrend(current, previous);
  });

  openTrend = computed(() => this.stats()?.open?.trend ?? this.weeklyTrend());

  closedTrend = computed(() => this.weeklyTrend());
  investigatingTrend = computed(() => this.weeklyTrend());
  criticalTrend = computed(() => this.weeklyTrend());

  riskZones = computed<ZoneRisk[]>(() => {
    const zones = this.stats()?.byZone ?? [];

    return zones
      .map((zone): ZoneRisk => {
        const incidents = zone.count;

        const risk: ZoneRisk['risk'] =
          incidents >= 5 ? 'critical' : incidents >= 2 ? 'warning' : 'stable';

        return {
          zone: zone.zoneName,
          incidents,
          risk,
        };
      })
      .sort((a, b) => b.incidents - a.incidents)
      .slice(0, 5);
  });

  activities = computed<ActivityItem[]>(() => {
    const recent = this.stats()?.recent?.length
      ? this.stats()?.recent ?? []
      : this.incidents();

    return recent.slice(0, 6).map((incident: any) => {
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
    this.refreshPage();
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

  loadStats(): void {
    this.isStatsLoading.set(true);

    this.incidentsStatsService.getStats().subscribe({
      next: (res) => {
        this.stats.set(res.data);
        this.isStatsLoading.set(false);
      },
      error: () => {
        this.isStatsLoading.set(false);
      },
    });
  }

  refreshPage(): void {
    this.loadIncidents();
    this.loadStats();
  }

  setFilter(filter: IncidentFilter): void {
    this.selectedFilter.set(filter);
  }

  private calcTrend(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  trendClass(value: number): string {
    if (value > 0) return 'up';
    if (value < 0) return 'down';
    return 'neutral';
  }

  trendIcon(value: number): string {
    if (value > 0) return 'bi bi-arrow-up-right';
    if (value < 0) return 'bi bi-arrow-down-right';
    return 'bi bi-dash-lg';
  }

  trendText(value: number): string {
    const abs = Math.abs(value);
    if (value > 0) return `+${abs}% vs semaine passée`;
    if (value < 0) return `-${abs}% vs semaine passée`;
    return `0% vs semaine passée`;
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