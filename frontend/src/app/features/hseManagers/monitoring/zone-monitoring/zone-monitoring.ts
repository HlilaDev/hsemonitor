import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';

import {
  ReadingItem,
  ReadingServices,
} from '../../../../core/services/readings/reading';

@Component({
  selector: 'app-zone-monitoring',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './zone-monitoring.html',
  styleUrl: './zone-monitoring.scss',
})
export class ZoneMonitoring implements OnInit {
  private route = inject(ActivatedRoute);
  private readingServices = inject(ReadingServices);

  isLoading = signal(true);
  error = signal<string | null>(null);

  zoneId = signal('');
  items = signal<ReadingItem[]>([]);

  readonly zoneName = computed(() => {
    const first = this.items()[0];
    return this.readingServices.getZoneName(first?.zone);
  });

  readonly totalDevices = computed(() => this.items().length);

  readonly onlineDevices = computed(() =>
    this.items().filter((item) => {
      const device = item.device;
      return typeof device !== 'string' && (device.status || '').toLowerCase() === 'online';
    }).length
  );

  readonly offlineDevices = computed(() =>
    this.items().filter((item) => {
      const device = item.device;
      return typeof device !== 'string' && (device.status || '').toLowerCase() === 'offline';
    }).length
  );

  readonly averageTemperature = computed(() => {
    const values = this.items()
      .map((item) => this.readingServices.getTemperature(item))
      .filter((v): v is number => typeof v === 'number');

    if (!values.length) return null;
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    return Number(avg.toFixed(1));
  });

  readonly averageHumidity = computed(() => {
    const values = this.items()
      .map((item) => this.readingServices.getHumidity(item))
      .filter((v): v is number => typeof v === 'number');

    if (!values.length) return null;
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    return Number(avg.toFixed(1));
  });

  readonly lastSync = computed(() => {
    if (!this.items().length) return null;
    return this.items()[0].ts;
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('zoneId') || '';
    this.zoneId.set(id);

    if (!id) {
      this.error.set('Identifiant de la zone introuvable.');
      this.isLoading.set(false);
      return;
    }

    this.loadZoneMonitoring(id);
  }

  loadZoneMonitoring(zoneId: string): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.readingServices.getLatestByZone(zoneId).subscribe({
      next: (res) => {
        this.items.set(res || []);
        this.isLoading.set(false);

        if (!res?.length) {
          this.error.set('Aucune donnée de monitoring trouvée pour cette zone.');
        }
      },
      error: () => {
        this.error.set('Impossible de charger le monitoring de la zone.');
        this.isLoading.set(false);
      },
    });
  }

  refresh(): void {
    if (!this.zoneId()) return;
    this.loadZoneMonitoring(this.zoneId());
  }

  getDeviceStatus(item: ReadingItem): string {
    const device = item.device;
    if (!device || typeof device === 'string') return 'unknown';
    return device.status || 'unknown';
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

  getDeviceLabel(item: ReadingItem): string {
    return this.readingServices.getDeviceName(item.device);
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

    if (temperature !== null) parts.push(`${temperature} °C`);
    if (humidity !== null) parts.push(`${humidity} %`);
    if (gas !== null) parts.push(`Gaz: ${gas}`);

    return parts.length ? parts.join(' / ') : '—';
  }
}