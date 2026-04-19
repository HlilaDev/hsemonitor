import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import {
  DeviceServices,
  SensorLite,
} from '../../../../core/services/devices/device-services';

type DeviceModel = any;

@Component({
  selector: 'app-device-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './device-details.html',
  styleUrl: './device-details.scss',
})
export class DeviceDetails {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private deviceService = inject(DeviceServices);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly device = signal<DeviceModel | null>(null);

  readonly sensorsLoading = signal(true);
  readonly sensorsError = signal<string | null>(null);
  readonly sensors = signal<SensorLite[]>([]);

  readonly id = computed(() => this.route.snapshot.paramMap.get('id') ?? '');

  constructor() {
    const id = this.id();
    if (!id) {
      this.loading.set(false);
      this.sensorsLoading.set(false);
      this.error.set('DEVICES.ERROR.MISSING_ID');
      return;
    }
    this.fetchDeviceAndSensors(id);
  }

  private fetchDeviceAndSensors(id: string) {
    this.fetchDevice(id);
    this.fetchSensors(id);
  }

  private fetchDevice(id: string) {
    this.loading.set(true);
    this.error.set(null);

    this.deviceService.getDeviceById(id).subscribe({
      next: (res: any) => {
        const dev = res?.device ?? res?.item ?? res?.data ?? res;
        this.device.set(dev ?? null);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('DEVICES.ERROR.LOAD_ONE');
        this.loading.set(false);
      },
    });
  }

  private fetchSensors(deviceId: string) {
    this.sensorsLoading.set(true);
    this.sensorsError.set(null);

    this.deviceService.getDeviceSensors(deviceId).subscribe({
      next: (res: any) => {
        const raw =
          res?.sensors ??
          res?.items ??
          res?.data ??
          (Array.isArray(res) ? res : []);

        const items = Array.isArray(raw) ? raw : [];

        const mapped: SensorLite[] = items.map((x: any, idx: number) => {
          if (typeof x === 'string') {
            const dev = this.device();
            return {
              _id: x || String(idx),
              name: x,
              type: 'unknown',
              zone: dev?.zone,
              status: dev?.status,
              threshold: null as any,
              unit: '',
              createdAt: dev?.createdAt,
            } as any;
          }

          return x as SensorLite;
        });

        this.sensors.set(mapped);
        this.sensorsLoading.set(false);
      },
      error: () => {
        this.sensorsError.set('DEVICES.DETAIL.SENSORS_LOAD_ERROR');
        this.sensors.set([]);
        this.sensorsLoading.set(false);
      },
    });
  }

  zoneName(zone: any): string {
    if (!zone) return '—';
    if (typeof zone === 'string') return zone;
    return zone?.name ?? zone?.label ?? zone?._id ?? '—';
  }

  back() {
    this.router.navigate(['/admin/devices']);
  }

  edit() {
    this.router.navigate(['/admin/devices', this.id(), 'edit']);
  }

  management() {
    this.router.navigate(['/admin/devices/management', this.id()]);
  }

  v(x: any): string {
    return x === null || x === undefined || x === '' ? '—' : String(x);
  }

  deviceStatusKey(status: any): string {
    const s = String(status ?? 'offline').toLowerCase();
    return `DEVICES.STATUS.${s}`;
  }

  sensorStatusKey(status: any): string {
    const s = String(status ?? 'offline').toLowerCase();
    return `SENSORS.STATUS.${s}`;
  }

  sensorTypeKey(type: any): string {
    const t = String(type ?? 'unknown').toLowerCase();
    return `SENSORS.TYPE.${t}`;
  }
}