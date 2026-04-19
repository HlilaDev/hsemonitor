
import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { catchError, finalize, of } from 'rxjs';

import {
  DeviceServices,
  Device,
} from '../../../../core/services/devices/device-services';

@Component({
  selector: 'app-all-devices',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TranslateModule,
  ],
  templateUrl: './all-devices.html',
  styleUrl: './all-devices.scss',
})
export class AllDevices {
  private deviceService = inject(DeviceServices);
  private t = inject(TranslateService);

  loading = signal(false);
  error = signal<string | null>(null);

  q = signal('');
  zone = signal('');
  status = signal('');

  devices = signal<Device[]>([]);

  page = signal(1);
  pageSize = signal(10);

  total = computed(() => this.devices().length);
  pages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));

  pagedDevices = computed(() => {
    const start = (this.page() - 1) * this.pageSize();
    return this.devices().slice(start, start + this.pageSize());
  });

  ngOnInit() {
    this.loadDevices();
  }

  trackByDevice = (_: number, d: any) => d?._id || d?.deviceId;

  loadDevices() {
    this.loading.set(true);
    this.error.set(null);

    this.deviceService
      .getAllDevices()
      .pipe(
        catchError((err) => {
          this.error.set(
            err?.error?.message ?? this.t.instant('DEVICES.ERROR.LOAD')
          );
          return of([] as Device[]);
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe((res: any) => {
        const items = res?.items ?? res?.devices ?? res ?? [];
        let list: Device[] = Array.isArray(items) ? items : [];

        const q = this.q().trim().toLowerCase();
        const zone = this.zone().trim().toLowerCase();
        const status = this.status().trim().toLowerCase();

        if (q) {
          list = list.filter((d: any) => {
            const name = (d?.name ?? '').toLowerCase();
            const deviceId = (d?.deviceId ?? '').toLowerCase();
            return name.includes(q) || deviceId.includes(q);
          });
        }

        if (zone) {
          list = list.filter((d: any) => {
            const z = d?.zone;
            if (!z) return false;

            if (typeof z === 'object') {
              const zoneName = (z?.name ?? '').toLowerCase();
              const zoneId = (z?._id ?? '').toLowerCase();
              return zoneName.includes(zone) || zoneId.includes(zone);
            }

            return String(z).toLowerCase().includes(zone);
          });
        }

        if (status) {
          list = list.filter(
            (d: any) => String(d?.status ?? '').toLowerCase() === status
          );
        }

        this.devices.set(list);
        this.page.set(1);
      });
  }

  onSearch() {
    this.page.set(1);
    this.loadDevices();
  }

  clearFilters() {
    this.q.set('');
    this.zone.set('');
    this.status.set('');
    this.page.set(1);
    this.loadDevices();
  }

  prev() {
    if (this.page() > 1) {
      this.page.update(v => v - 1);
    }
  }

  next() {
    if (this.page() < this.pages()) {
      this.page.update(v => v + 1);
    }
  }

  getRowId(d: any): string {
    return d?._id || d?.deviceId;
  }

  getZoneName(d: any): string {
    const z = d?.zone;
    if (!z) return '—';

    if (typeof z === 'object') {
      return z?.name || z?._id || '—';
    }

    return String(z);
  }

  getSensorsCount(d: any): number {
    return Array.isArray(d?.sensors) ? d.sensors.length : 0;
  }

  getStatusKey(d: any): string {
    return 'DEVICES.STATUS.' + (d?.status ?? 'offline');
  }

  badgeClass(status: string | undefined): string {
    if (status === 'online') return 'ok';
    if (status === 'maintenance') return 'warn';
    return 'bad';
  }

  deleteDevice(idOrDeviceId: string) {
    const msg = this.t.instant('DEVICES.CONFIRM_DELETE');
    if (!confirm(msg)) return;

    this.loading.set(true);
    this.error.set(null);

    this.deviceService
      .deleteDevice(idOrDeviceId)
      .pipe(
        catchError((err) => {
          this.error.set(
            err?.error?.message ?? this.t.instant('DEVICES.ERROR.DELETE')
          );
          return of(null);
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe((res) => {
        if (res === null) return;

        const next = this.devices().filter(
          (d: any) =>
            d?._id !== idOrDeviceId && d?.deviceId !== idOrDeviceId
        );

        this.devices.set(next);

        if (this.page() > this.pages()) {
          this.page.set(this.pages());
        }
      });
  }
}