import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { ZoneServices, Zone } from '../../../../core/services/zones/zone-services';
import { AuthServices } from '../../../../core/services/auth/auth-services';

type ZoneStatus = 'active' | 'inactive' | 'warning';
type ZoneRisk = 'low' | 'medium' | 'high';

type ZoneCard = {
  _id: string;
  name: string;
  code?: string;
  description?: string;
  status: ZoneStatus;
  riskLevel: ZoneRisk;
  employeesCount: number;
  devicesCount: number;
  sensorsCount: number;
  alertsCount: number;
  temperature?: number | null;
  humidity?: number | null;
};

@Component({
  selector: 'app-zones-overview',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './zones-overview.html',
  styleUrl: './zones-overview.scss',
})
export class ZonesOverview {
  private zoneService = inject(ZoneServices);
  private authService = inject(AuthServices);

  loading = signal(true);
  error = signal<string | null>(null);

  search = signal('');
  statusFilter = signal('');
  riskFilter = signal('');

  zones = signal<ZoneCard[]>([]);

  constructor() {
    this.loadZones();
  }

  loadZones(): void {
    this.loading.set(true);
    this.error.set(null);

    this.authService.me().subscribe({
      next: (meRes) => {
        const company = meRes?.user?.company;
        const companyId =
          typeof company === 'string'
            ? company
            : company?._id;

        if (!companyId) {
          this.zones.set([]);
          this.error.set('COMMON.ERROR');
          this.loading.set(false);
          return;
        }

        this.zoneService.getAllZones(companyId).subscribe({
          next: (res) => {
            const items = res?.items ?? [];

            const mapped = items.map((zone) => this.mapZoneToCard(zone));
            this.zones.set(mapped);
            this.loading.set(false);
          },
          error: () => {
            this.error.set('ZONES.ERROR.LOAD');
            this.loading.set(false);
          },
        });
      },
      error: () => {
        this.error.set('AUTH.ERRORS.UNAUTHORIZED');
        this.loading.set(false);
      },
    });
  }

  mapZoneToCard(zone: Zone): ZoneCard {
    const alertsCount = zone.alertsCount ?? 0;
    const isActive = zone.isActive ?? false;

    let status: ZoneStatus = 'inactive';

    if (!isActive) {
      status = 'inactive';
    } else if (alertsCount > 0) {
      status = 'warning';
    } else {
      status = 'active';
    }

return {
  _id: zone._id,
  name: zone.name,
  code: zone.code ?? '',
  description: zone.description ?? '',
  status,
  riskLevel: zone.riskLevel ?? 'low',
  employeesCount: zone.employeesCount ?? 0,
  devicesCount: zone.devicesCount ?? 0,
  sensorsCount: zone.sensorsCount ?? 0,
  alertsCount: zone.alertsCount ?? 0,
  temperature: zone.temperature ?? null,
  humidity: zone.humidity ?? null,
};
  }

  filteredZones = computed(() => {
    const q = this.search().trim().toLowerCase();
    const status = this.statusFilter().trim().toLowerCase();
    const risk = this.riskFilter().trim().toLowerCase();

    return this.zones().filter((z) => {
      const matchSearch =
        !q ||
        z.name.toLowerCase().includes(q) ||
        (z.code ?? '').toLowerCase().includes(q) ||
        (z.description ?? '').toLowerCase().includes(q);

      const matchStatus = !status || z.status.toLowerCase() === status;
      const matchRisk = !risk || z.riskLevel.toLowerCase() === risk;

      return matchSearch && matchStatus && matchRisk;
    });
  });

  totalZones = computed(() => this.zones().length);

  activeZones = computed(
    () => this.zones().filter((z) => z.status === 'active').length
  );

  warningZones = computed(
    () => this.zones().filter((z) => z.status === 'warning').length
  );

  totalAlerts = computed(() =>
    this.zones().reduce((sum, z) => sum + z.alertsCount, 0)
  );

  clearFilters(): void {
    this.search.set('');
    this.statusFilter.set('');
    this.riskFilter.set('');
  }

  trackByZone = (_: number, zone: ZoneCard) => zone._id;

  statusKey(status: ZoneStatus): string {
    return `ZONES.OVERVIEW.STATUS.${status}`;
  }

  riskKey(risk: ZoneRisk): string {
    return `ZONES.OVERVIEW.RISK.${risk}`;
  }

  statusClass(status: ZoneStatus): string {
    if (status === 'active') return 'ok';
    if (status === 'warning') return 'warn';
    return 'bad';
  }

  riskClass(risk: ZoneRisk): string {
    if (risk === 'low') return 'ok';
    if (risk === 'medium') return 'warn';
    return 'bad';
  }

  value(v: string | number | null | undefined): string {
    return v === null || v === undefined || v === '' ? '—' : String(v);
  }
}