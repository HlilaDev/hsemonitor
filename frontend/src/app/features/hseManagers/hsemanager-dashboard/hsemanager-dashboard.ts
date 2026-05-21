import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';

import {
  IncidentEvent,
  IncidentEventServices,
  IncidentSeverity,
  IncidentStatus,
} from '../../../core/services/incidentEvents/incident-event-services';

import {
  Observation,
  ObservationService,
  ObservationStatus,
} from '../../../core/services/observations/observation-services';

import {
  Zone,
  ZoneServices,
} from '../../../core/services/zones/zone-services';

type StatCard = {
  label: string;
  value: number;
  unit?: string;
  icon: string;
  trend?: number;
  tone: 'primary' | 'success' | 'warn' | 'danger';
};

type ZoneRisk = {
  id: string;
  name: string;
  risk: 'low' | 'medium' | 'high';
  temperature: number;
  humidity: number;
  devicesOnline: number;
  devicesTotal: number;
};

type IncidentItem = {
  id: string;
  title: string;
  zone: string;
  severity: IncidentSeverity;
  date: string;
  status: IncidentStatus;
};

type ObservationItem = {
  id: string;
  title: string;
  zone: string;
  createdAt: string;
  status: ObservationStatus;
};

type TrainingItem = {
  id: string;
  title: string;
  audience: string;
  completion: number;
  dueDate: string;
};

type TeamActivity = {
  id: string;
  name: string;
  role: string;
  task: string;
  status: 'active' | 'idle' | 'offline';
};

type AlertItem = {
  id: string;
  message: string;
  zone: string;
  level: 'info' | 'warning' | 'critical';
  time: string;
};

@Component({
  selector: 'app-hsemanager-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './hsemanager-dashboard.html',
  styleUrl: './hsemanager-dashboard.scss',
})
export class HsemanagerDashboard implements OnInit {
  private readonly incidentService = inject(IncidentEventServices);
  private readonly observationService = inject(ObservationService);
  private readonly zoneService = inject(ZoneServices);

  readonly loadingZones = signal(false);
  readonly loadingIncidents = signal(false);
  readonly loadingObservations = signal(false);

  readonly zonesError = signal<string | null>(null);
  readonly incidentsError = signal<string | null>(null);
  readonly observationsError = signal<string | null>(null);

  readonly openIncidentsCount = signal(0);
  readonly openObservationsCount = signal(0);

  readonly zones = signal<ZoneRisk[]>([]);
  readonly incidents = signal<IncidentItem[]>([]);
  readonly observations = signal<ObservationItem[]>([]);

  readonly trainings = signal<TrainingItem[]>([
    {
      id: 't1',
      title: 'Exercice sécurité incendie',
      audience: 'Équipe production',
      completion: 84,
      dueDate: '2026-03-12',
    },
    {
      id: 't2',
      title: 'Bases de conformité EPI',
      audience: 'Tous les opérateurs',
      completion: 67,
      dueDate: '2026-03-15',
    },
    {
      id: 't3',
      title: 'Sensibilisation risques chimiques',
      audience: 'Entrepôt + HSE',
      completion: 52,
      dueDate: '2026-03-18',
    },
  ]);

  readonly team = signal<TeamActivity[]>([
    {
      id: 'u1',
      name: 'Sarra Trabelsi',
      role: 'Agent HSE',
      task: 'Inspection zone - Production A',
      status: 'active',
    },
    {
      id: 'u2',
      name: 'Ahmed Ben Ali',
      role: 'Superviseur sécurité',
      task: 'Suivi des incidents',
      status: 'active',
    },
  ]);

  readonly alerts = signal<AlertItem[]>([
    {
      id: 'a1',
      message: 'Valeur gaz anormale détectée',
      zone: 'Stockage chimique',
      level: 'critical',
      time: 'il y a 2 min',
    },
    {
      id: 'a2',
      message: 'Maintenance appareil requise',
      zone: 'Production A',
      level: 'warning',
      time: 'il y a 18 min',
    },
  ]);

  readonly complianceRate = signal(91);
  readonly devicesOnline = signal(0);
  readonly devicesTotal = signal(0);

  readonly highRiskZones = computed(
    () => this.zones().filter(zone => zone.risk === 'high').length
  );

  readonly trainingCompletionRate = computed(() => {
    const items = this.trainings();
    if (!items.length) return 0;

    const total = items.reduce((sum, item) => sum + item.completion, 0);
    return Math.round(total / items.length);
  });

  readonly stats = computed<StatCard[]>(() => [
    {
      label: 'Zones surveillées',
      value: this.zones().length,
      icon: 'bi bi-geo-alt',
      trend: 0,
      tone: 'primary',
    },
    {
      label: 'Observations ouvertes',
      value: this.openObservationsCount(),
      icon: 'bi bi-search',
      trend: 0,
      tone: 'success',
    },
    {
      label: 'Incidents ouverts',
      value: this.openIncidentsCount(),
      icon: 'bi bi-exclamation-triangle',
      trend: 0,
      tone: 'warn',
    },
    {
      label: 'Formation complétée',
      value: this.trainingCompletionRate(),
      unit: '%',
      icon: 'bi bi-mortarboard',
      trend: 0,
      tone: 'danger',
    },
  ]);

readonly chartBars = computed(() => {
  const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  const data = days.map((label, index) => {
    const value = this.incidents().filter(incident => {
      const date = new Date(incident.date);
      return date.getDay() === index;
    }).length;

    return {
      label,
      value,
    };
  });

  const max = Math.max(...data.map(item => item.value), 1);

  return data.map(item => ({
    ...item,
    height: `${(item.value / max) * 100}%`,
  }));
});

incidentTooltip(bar: { label: string; value: number }): string {
  return `${bar.label} : ${bar.value} incident${bar.value > 1 ? 's' : ''}`;
}

  ngOnInit(): void {
    this.loadZones();
    this.loadOpenIncidents();
    this.loadOpenObservations();
  }

  loadZones(): void {
    this.loadingZones.set(true);
    this.zonesError.set(null);

    this.zoneService.getAllZones(undefined, true).subscribe({
      next: response => {
        const items = response.items || [];

        this.zones.set(items.map(zone => this.mapZone(zone)));

        this.devicesTotal.set(
          items.reduce((sum, zone) => sum + this.getDevicesTotal(zone), 0)
        );

        this.devicesOnline.set(
          items.reduce((sum, zone) => sum + this.getDevicesOnline(zone), 0)
        );

        this.loadingZones.set(false);
      },
      error: err => {
        console.error('Erreur chargement zones dashboard:', err);

        this.zones.set([]);
        this.devicesTotal.set(0);
        this.devicesOnline.set(0);
        this.zonesError.set('Impossible de charger les zones.');
        this.loadingZones.set(false);
      },
    });
  }

  loadOpenIncidents(): void {
    this.loadingIncidents.set(true);
    this.incidentsError.set(null);

    this.incidentService
      .listIncidentEvents({
        status: 'open',
        page: 1,
        limit: 5,
        sort: '-createdAt',
      })
      .subscribe({
        next: response => {
          this.openIncidentsCount.set(response.meta.total);
          this.incidents.set(response.items.map(item => this.mapIncident(item)));
          this.loadingIncidents.set(false);
        },
        error: err => {
          console.error('Erreur chargement incidents dashboard:', err);

          this.openIncidentsCount.set(0);
          this.incidents.set([]);
          this.incidentsError.set('Impossible de charger les incidents ouverts.');
          this.loadingIncidents.set(false);
        },
      });
  }

  loadOpenObservations(): void {
    this.loadingObservations.set(true);
    this.observationsError.set(null);

    forkJoin({
      open: this.observationService.list({
        status: 'open',
        page: 1,
        limit: 5,
        sort: '-createdAt',
      }),
      inProgress: this.observationService.list({
        status: 'in_progress',
        page: 1,
        limit: 5,
        sort: '-createdAt',
      }),
    }).subscribe({
      next: ({ open, inProgress }) => {
        this.openObservationsCount.set(open.meta.total + inProgress.meta.total);

        const items = [...open.items, ...inProgress.items]
          .sort(
            (a, b) =>
              new Date(b.createdAt || b.updatedAt || 0).getTime() -
              new Date(a.createdAt || a.updatedAt || 0).getTime()
          )
          .slice(0, 5);

        this.observations.set(items.map(item => this.mapObservation(item)));
        this.loadingObservations.set(false);
      },
      error: err => {
        console.error('Erreur chargement observations dashboard:', err);

        this.openObservationsCount.set(0);
        this.observations.set([]);
        this.observationsError.set(
          'Impossible de charger les observations ouvertes.'
        );
        this.loadingObservations.set(false);
      },
    });
  }

  private mapZone(zone: Zone): ZoneRisk {
    return {
      id: zone._id,
      name: zone.name || 'Zone sans nom',
      risk: this.normalizeRisk(zone.riskLevel),
      temperature: this.getZoneMetric(zone, ['temperature', 'temp']),
      humidity: this.getZoneMetric(zone, ['humidity']),
      devicesOnline: this.getDevicesOnline(zone),
      devicesTotal: this.getDevicesTotal(zone),
    };
  }

  private mapIncident(item: IncidentEvent): IncidentItem {
    return {
      id: item._id,
      title: item.title || 'Incident sans titre',
      zone: this.getName(item.zone, 'Zone non définie'),
      severity: item.severity || 'medium',
      date: item.createdAt || item.updatedAt || new Date().toISOString(),
      status: item.status,
    };
  }

  private mapObservation(item: Observation): ObservationItem {
    return {
      id: item._id,
      title: item.title || 'Observation sans titre',
      zone: this.getName(item.zone, 'Zone non définie'),
      createdAt: item.createdAt || item.updatedAt || new Date().toISOString(),
      status: item.status,
    };
  }

  private getDevicesTotal(zone: Zone): number {
    const devices = (zone as any).devices;

    if (Array.isArray(devices)) return devices.length;

    return Number(
      (zone as any).devicesTotal ??
        (zone as any).devicesCount ??
        (zone as any).deviceCount ??
        0
    );
  }

  private getDevicesOnline(zone: Zone): number {
    const devices = (zone as any).devices;

    if (Array.isArray(devices)) {
      return devices.filter((device: any) => device.status === 'online').length;
    }

    return Number(
      (zone as any).devicesOnline ??
        (zone as any).onlineDevices ??
        (zone as any).onlineDevicesCount ??
        0
    );
  }

  private getZoneMetric(zone: Zone, keys: string[]): number {
    for (const key of keys) {
      const value = (zone as any)[key];

      if (typeof value === 'number') return value;

      if (!Number.isNaN(Number(value)) && value !== undefined && value !== null) {
        return Number(value);
      }
    }

    return 0;
  }

  private normalizeRisk(value: any): 'low' | 'medium' | 'high' {
    if (value === 'high' || value === 'critical') return 'high';
    if (value === 'medium' || value === 'warning') return 'medium';
    return 'low';
  }

  private getName(value: any, fallback: string): string {
    if (!value) return fallback;
    if (typeof value === 'string') return value;
    return value.name || value.title || fallback;
  }

  riskClass(risk: string): string {
    if (risk === 'low') return 'ok';
    if (risk === 'medium') return 'warn';
    return 'bad';
  }

  severityClass(level: string): string {
    if (level === 'low' || level === 'info') return 'ok';

    if (
      level === 'medium' ||
      level === 'warning' ||
      level === 'in_progress' ||
      level === 'reviewed'
    ) {
      return 'warn';
    }

    return 'bad';
  }

  incidentStatusClass(status: string): string {
    if (status === 'closed' || status === 'resolved') return 'ok';
    if (status === 'in_progress' || status === 'reviewed') return 'warn';
    return 'bad';
  }

  teamStatusClass(status: string): string {
    if (status === 'active') return 'ok';
    if (status === 'idle') return 'warn';
    return 'bad';
  }

  trackById = (_: number, item: { id: string }) => item.id;
}