import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';

import {
  ReadingItem,
  ReadingServices,
} from '../../../../core/services/readings/reading';

import {
  AiPrediction,
  AiPredictionServices,
} from '../../../../core/services/ai/ai-prediction/ai-prediction-services';

type ZoneSummary = {
  zoneId: string;
  zoneName: string;
  latestReading: ReadingItem;
  deviceCount: number;
};

@Component({
  selector: 'app-monitoring-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './monitoring-dashboard.html',
  styleUrl: './monitoring-dashboard.scss',
})
export class MonitoringDashboard implements OnInit {
  private readingServices = inject(ReadingServices);
  private aiPredictionServices = inject(AiPredictionServices);

  isLoading = signal(true);
  error = signal<string | null>(null);

  latestReadings = signal<ReadingItem[]>([]);

  aiPrediction = signal<AiPrediction | null>(null);
  isAiLoading = signal(false);
  aiError = signal<string | null>(null);

  selectedAiMode = signal<'global' | 'zone'>('global');
  selectedAiZone = signal<string | null>(null);

  readonly totalDevices = computed(() => {
    const ids = new Set<string>();

    for (const item of this.latestReadings()) {
      const device = item.device;

      if (typeof device === 'string') {
        ids.add(device);
      } else if (device?._id) {
        ids.add(device._id);
      } else if (device?.deviceId) {
        ids.add(device.deviceId);
      }
    }

    return ids.size;
  });

  readonly onlineDevices = computed(() => {
    return this.latestReadings().filter((item) => {
      const device = item.device;

      return (
        typeof device !== 'string' &&
        (device.status || '').toLowerCase() === 'online'
      );
    }).length;
  });

  readonly offlineDevices = computed(() => {
    return this.latestReadings().filter((item) => {
      const device = item.device;

      return (
        typeof device !== 'string' &&
        (device.status || '').toLowerCase() === 'offline'
      );
    }).length;
  });

  readonly activeZones = computed(() => {
    const ids = new Set<string>();

    for (const item of this.latestReadings()) {
      const zone = item.zone;

      if (typeof zone === 'string') {
        ids.add(zone);
      } else if (zone?._id) {
        ids.add(zone._id);
      }
    }

    return ids.size;
  });

  readonly averageTemperature = computed(() => {
    const values = this.latestReadings()
      .map((item) => this.readingServices.getTemperature(item))
      .filter((value): value is number => typeof value === 'number');

    if (!values.length) return null;

    const avg = values.reduce((sum, value) => sum + value, 0) / values.length;
    return Number(avg.toFixed(1));
  });

  readonly averageHumidity = computed(() => {
    const values = this.latestReadings()
      .map((item) => this.readingServices.getHumidity(item))
      .filter((value): value is number => typeof value === 'number');

    if (!values.length) return null;

    const avg = values.reduce((sum, value) => sum + value, 0) / values.length;
    return Number(avg.toFixed(1));
  });

  readonly latestZones = computed<ZoneSummary[]>(() => {
    const map = new Map<string, ZoneSummary>();

    for (const item of this.latestReadings()) {
      const zone = item.zone;

      const zoneId =
        typeof zone === 'string' ? zone : zone?._id || 'unknown-zone';

      const zoneName = this.readingServices.getZoneName(zone);

      if (!map.has(zoneId)) {
        map.set(zoneId, {
          zoneId,
          zoneName,
          latestReading: item,
          deviceCount: 1,
        });
      } else {
        const current = map.get(zoneId)!;
        current.deviceCount += 1;

        if (
          new Date(item.ts).getTime() >
          new Date(current.latestReading.ts).getTime()
        ) {
          current.latestReading = item;
        }
      }
    }

    return Array.from(map.values()).sort(
      (a, b) =>
        new Date(b.latestReading.ts).getTime() -
        new Date(a.latestReading.ts).getTime()
    );
  });

  readonly alerts = computed(() => {
    const alerts: {
      level: 'critical' | 'warning' | 'info';
      title: string;
      message: string;
    }[] = [];

    for (const item of this.latestReadings()) {
      const deviceName = this.readingServices.getDeviceName(item.device);
      const zoneName = this.readingServices.getZoneName(item.zone);
      const temp = this.readingServices.getTemperature(item);
      const humidity = this.readingServices.getHumidity(item);
      const gas = this.readingServices.getGas(item);

      const status =
        typeof item.device !== 'string'
          ? (item.device.status || '').toLowerCase()
          : '';

      if (status === 'offline') {
        alerts.push({
          level: 'warning',
          title: 'Device hors ligne',
          message: `${deviceName} dans ${zoneName} est hors ligne.`,
        });
      }

      if (temp !== null && temp >= 35) {
        alerts.push({
          level: 'critical',
          title: 'Température élevée',
          message: `${deviceName} a remonté ${temp} °C dans ${zoneName}.`,
        });
      }

      if (humidity !== null && humidity >= 80) {
        alerts.push({
          level: 'warning',
          title: 'Humidité élevée',
          message: `${deviceName} a remonté ${humidity} % dans ${zoneName}.`,
        });
      }

      if (gas !== null && gas >= 400) {
        alerts.push({
          level: 'critical',
          title: 'Gaz élevé',
          message: `${deviceName} a remonté une valeur gaz de ${gas}.`,
        });
      }
    }

    return alerts.slice(0, 6);
  });

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.aiPrediction.set(null);
    this.aiError.set(null);
    this.selectedAiMode.set('global');
    this.selectedAiZone.set(null);

    this.readingServices.getReadings({ page: 1, limit: 50 }).subscribe({
      next: (response) => {
        const items = response.items || [];

        this.latestReadings.set(items);
        this.isLoading.set(false);

        if (!items.length) {
          this.error.set('Aucune donnée de monitoring disponible.');
        }
      },
      error: () => {
        this.error.set('Impossible de charger le dashboard monitoring.');
        this.isLoading.set(false);
      },
    });
  }

  selectAiMode(mode: 'global' | 'zone'): void {
    this.selectedAiMode.set(mode);
    this.aiPrediction.set(null);
    this.aiError.set(null);

    if (mode === 'global') {
      this.selectedAiZone.set(null);
    }
  }

  selectAiZone(zoneId: string): void {
    this.selectedAiMode.set('zone');
    this.selectedAiZone.set(zoneId);
    this.aiPrediction.set(null);
    this.aiError.set(null);
  }

  runAiPrediction(): void {
    this.aiPrediction.set(null);
    this.aiError.set(null);

    if (this.selectedAiMode() === 'global') {
      this.loadAiPrediction('global');
      return;
    }

    const zoneId = this.selectedAiZone();

    if (!zoneId || zoneId === 'unknown-zone') {
      this.aiError.set('Veuillez choisir une zone avant de lancer l’analyse IA.');
      return;
    }

    this.loadAiPrediction(zoneId);
  }

  private loadAiPrediction(zoneId: string): void {
    this.isAiLoading.set(true);
    this.aiError.set(null);

    this.aiPredictionServices.predictZoneRisk(zoneId).subscribe({
      next: (response: { prediction: any; }) => {
        this.aiPrediction.set(response.prediction);
        this.isAiLoading.set(false);
      },
      error: () => {
        this.aiError.set(
          zoneId === 'global'
            ? 'Impossible de charger la prédiction IA globale.'
            : 'Impossible de charger la prédiction IA pour cette zone.'
        );
        this.isAiLoading.set(false);
      },
    });
  }

  refresh(): void {
    this.loadDashboard();
  }

  getAiRiskLabel(level: string): string {
    switch (level) {
      case 'low':
        return 'Faible';
      case 'medium':
        return 'Moyen';
      case 'high':
        return 'Élevé';
      case 'critical':
        return 'Critique';
      default:
        return level;
    }
  }

  getStatusClass(status: string | null | undefined): string {
    switch ((status || '').toLowerCase()) {
      case 'online':
        return 'online';
      case 'offline':
        return 'offline';
      case 'maintenance':
        return 'maintenance';
      default:
        return 'unknown';
    }
  }

  getAlertClass(level: string): string {
    switch (level) {
      case 'critical':
        return 'critical';
      case 'warning':
        return 'warning';
      default:
        return 'info';
    }
  }

  getDeviceStatus(item: ReadingItem): string {
    const device = item.device;

    if (!device || typeof device === 'string') {
      return 'unknown';
    }

    return device.status || 'unknown';
  }

  getDeviceLabel(item: ReadingItem): string {
    return this.readingServices.getDeviceName(item.device);
  }

  getZoneLabel(item: ReadingItem): string {
    return this.readingServices.getZoneName(item.zone);
  }

  getDeviceRouteId(item: ReadingItem): string {
    if (item.raw?.deviceId) {
      return item.raw.deviceId;
    }

    const device = item.device;

    if (typeof device !== 'string' && device?.deviceId) {
      return device.deviceId;
    }

    return '';
  }

  getZoneRouteId(summary: ZoneSummary): string {
    return summary.zoneId;
  }

  getTemperature(item: ReadingItem): string {
    const value = this.readingServices.getTemperature(item);
    return value !== null ? `${value} °C` : '—';
  }

  getHumidity(item: ReadingItem): string {
    const value = this.readingServices.getHumidity(item);
    return value !== null ? `${value} %` : '—';
  }

  getGas(item: ReadingItem): string {
    const value = this.readingServices.getGas(item);
    return value !== null ? `${value}` : '—';
  }

  formatValues(item: ReadingItem): string {
    const parts: string[] = [];

    const temperature = this.readingServices.getTemperature(item);
    const humidity = this.readingServices.getHumidity(item);
    const gas = this.readingServices.getGas(item);

    if (temperature !== null) {
      parts.push(`${temperature} °C`);
    }

    if (humidity !== null) {
      parts.push(`${humidity} %`);
    }

    if (gas !== null) {
      parts.push(`Gaz: ${gas}`);
    }

    return parts.length ? parts.join(' / ') : '—';
  }
}