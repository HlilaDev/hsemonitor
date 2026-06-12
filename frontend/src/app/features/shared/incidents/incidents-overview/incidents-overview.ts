import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslatePipe, TranslateService } from '@ngx-translate/core';

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
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './incidents-overview.html',
  styleUrl: './incidents-overview.scss',
})
export class IncidentsOverview implements OnInit {
  private incidentService = inject(IncidentEventServices);
  private incidentsStatsService = inject(IncidentsStatsServices);
  private translate = inject(TranslateService);

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

// ✅ Après
openTrend = computed(() => null);
closedTrend = computed(() => null);
investigatingTrend = computed(() => null);
criticalTrend = computed(() => null);

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
            err?.error?.message ||
              this.translate.instant('incidents.errors.loadFailed')
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
    if (value > 0) return `+${abs}% ${this.translate.instant('incidents.trend.vsLastWeek')}`;
    if (value < 0) return `-${abs}% ${this.translate.instant('incidents.trend.vsLastWeek')}`;
    return `0% ${this.translate.instant('incidents.trend.vsLastWeek')}`;
  }

  severityLabel(value?: IncidentSeverity): string {
    if (!value) return this.translate.instant('incidents.severity.undefined');
    return this.translate.instant(`incidents.severity.${value}`);
  }

  statusLabel(value?: IncidentStatus): string {
    if (!value) return this.translate.instant('incidents.status.unknown');
    const key = value === 'in_progress' ? 'inProgress'
               : value === 'false_positive' ? 'falsePositive'
               : value;
    return this.translate.instant(`incidents.status.${key}`);
  }

  riskLabel(value: ZoneRisk['risk']): string {
    return this.translate.instant(`incidents.risk.${value}`);
  }

  typeLabel(type?: string): string {
    if (!type) return this.translate.instant('incidents.types.other');
    const key = type.toLowerCase();
    const translated = this.translate.instant(`incidents.types.${key}`);
    // fallback si clé non trouvée dans le JSON
    return translated.startsWith('incidents.types.') ? type : translated;
  }

  getZoneName(zone: any): string {
    if (!zone) return this.translate.instant('incidents.zones.undefined');
    if (typeof zone === 'string') return zone;
    return zone.name || zone.label || this.translate.instant('incidents.zones.undefined');
  }

  getReportedBy(incident: IncidentEvent): string {
    const user = incident.reportedBy;
    const fallback = this.translate.instant('incidents.unassigned');

    if (!user) return fallback;
    if (typeof user === 'string') return user;

    return (
      user.fullName ||
      `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
      user.email ||
      fallback
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