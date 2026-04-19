import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { catchError, finalize, forkJoin, of } from 'rxjs';

import {
  ReadingItem,
  ReadingServices,
} from '../../../../core/services/readings/reading';

import {
  SensorTrendCurve,
  TrendPoint,
} from '../../../shared/components/sensor-trend-curve/sensor-trend-curve';

@Component({
  selector: 'app-device-monitoring',
  standalone: true,
  imports: [CommonModule, RouterModule, SensorTrendCurve],
  templateUrl: './device-monitoring.html',
  styleUrl: './device-monitoring.scss',
})
export class DeviceMonitoring implements OnInit {
  private route = inject(ActivatedRoute);
  private readingServices = inject(ReadingServices);

  isLoading = signal(true);
  error = signal<string | null>(null);

  deviceId = signal('');
  latestReading = signal<ReadingItem | null>(null);
  history = signal<ReadingItem[]>([]);

  periodMinutes = signal(30);

  readonly deviceName = computed(() =>
    this.readingServices.getDeviceName(this.latestReading()?.device)
  );

  readonly zoneName = computed(() =>
    this.readingServices.getZoneName(this.latestReading()?.zone)
  );

  readonly temperature = computed(() =>
    this.readingServices.getTemperature(this.latestReading())
  );

  readonly humidity = computed(() =>
    this.readingServices.getHumidity(this.latestReading())
  );

  readonly gas = computed(() =>
    this.readingServices.getGas(this.latestReading())
  );

  readonly latestStatus = computed(() => {
    const device = this.latestReading()?.device;
    if (!device || typeof device === 'string') return 'unknown';
    return device.status || 'unknown';
  });

  readonly sortedHistory = computed(() => {
    return [...this.history()].sort(
      (a, b) => this.toTimestamp(a.ts) - this.toTimestamp(b.ts)
    );
  });

  readonly temperaturePoints = computed<TrendPoint[]>(() => {
    return this.buildPointsByPeriod('temperature', this.periodMinutes());
  });

  readonly humidityPoints = computed<TrendPoint[]>(() => {
    return this.buildPointsByPeriod('humidity', this.periodMinutes());
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('deviceId') || '';
    this.deviceId.set(id);

    if (!id) {
      this.error.set('Identifiant du device introuvable.');
      this.isLoading.set(false);
      return;
    }

    this.loadDeviceMonitoring(id);
  }

  loadDeviceMonitoring(deviceId: string): void {
    this.isLoading.set(true);
    this.error.set(null);

    forkJoin({
      latest: this.readingServices.getLatestByDevice(deviceId).pipe(
        catchError(() => of(null))
      ),
      history: this.readingServices
        .getHistoryByDevice(deviceId, { limit: 500 })
        .pipe(catchError(() => of([] as ReadingItem[]))),
    })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: ({ latest, history }) => {
          this.latestReading.set(latest);
          this.history.set(Array.isArray(history) ? history : []);

          if (!latest && (!history || history.length === 0)) {
            this.error.set('Impossible de charger les données du device.');
          }
        },
        error: () => {
          this.latestReading.set(null);
          this.history.set([]);
          this.error.set('Impossible de charger les données du device.');
        },
      });
  }

  refresh(): void {
    if (!this.deviceId()) return;
    this.loadDeviceMonitoring(this.deviceId());
  }

  setPeriod(minutes: number): void {
    this.periodMinutes.set(minutes);
  }

  formatValues(item: ReadingItem): string {
    const v = item.values || {};
    const parts: string[] = [];

    if (typeof v.temperature === 'number') parts.push(`${v.temperature} °C`);
    if (typeof v.humidity === 'number') parts.push(`${v.humidity} %`);
    if (typeof v.gas === 'number') parts.push(`Gaz: ${v.gas}`);

    return parts.length ? parts.join(' / ') : '—';
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

  asDeviceIdLabel(): string {
    return this.deviceName() && this.deviceName() !== '—'
      ? this.deviceName()
      : this.deviceId();
  }

  private buildPointsByPeriod(
    key: 'temperature' | 'humidity',
    periodMinutes: number
  ): TrendPoint[] {
    const bucketSize = periodMinutes * 60 * 1000;
    const buckets = new Map<number, number[]>();

    for (const item of this.sortedHistory()) {
      const value = item.values?.[key];

      if (typeof value !== 'number') continue;

      const ts = this.toTimestamp(item.ts);
      if (!ts) continue;

      const bucketStart = Math.floor(ts / bucketSize) * bucketSize;

      if (!buckets.has(bucketStart)) {
        buckets.set(bucketStart, []);
      }

      buckets.get(bucketStart)!.push(Number(value));
    }

    return Array.from(buckets.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([bucketStart, values]) => ({
        label: this.formatBucketLabel(bucketStart, periodMinutes),
        value: Number(
          (
            values.reduce((sum, current) => sum + current, 0) / values.length
          ).toFixed(2)
        ),
      }));
  }

  private formatBucketLabel(timestamp: number, periodMinutes: number): string {
    const date = new Date(timestamp);

    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private toTimestamp(value: string | Date | undefined | null): number {
    if (!value) return 0;
    return new Date(value).getTime();
  }
}