import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { catchError, finalize, forkJoin, of } from 'rxjs';

import { ZoneServices, Zone } from '../../../../core/services/zones/zone-services';
import { DeviceServices, Device } from '../../../../core/services/devices/device-services';
import { EmployeeServices, Employee } from '../../../../core/services/employees/employee-services';

type ZoneDevice = {
  _id: string;
  name: string;
  deviceId: string;
  status: 'online' | 'offline' | 'maintenance';
};

type ZoneSensor = {
  _id: string;
  name: string;
  type: string;
  status: 'online' | 'offline' | 'maintenance';
};

type ZoneEmployee = {
  _id: string;
  fullName: string;
  department?: string;
  jobTitle?: string;
  isActive?: boolean;
};

type ZoneModel = {
  _id: string;
  name: string;
  description?: string;
  riskLevel: 'low' | 'medium' | 'high';
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  temperature?: number | null;
  humidity?: number | null;
  alertsCount?: number;
  devices?: ZoneDevice[];
  sensors?: ZoneSensor[];
  employees?: ZoneEmployee[];
};

@Component({
  selector: 'app-zone-details',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './zone-details.html',
  styleUrl: './zone-details.scss',
})
export class ZoneDetails {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private zoneService = inject(ZoneServices);
  private deviceService = inject(DeviceServices);
  private employeeService = inject(EmployeeServices);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly zone = signal<ZoneModel | null>(null);

  readonly zoneId = computed(() => this.route.snapshot.paramMap.get('id') ?? '');

  readonly devicesCount = computed(() => this.zone()?.devices?.length ?? 0);
  readonly sensorsCount = computed(() => this.zone()?.sensors?.length ?? 0);
  readonly employeesCount = computed(() => this.zone()?.employees?.length ?? 0);

  constructor() {
    this.loadZoneDetails();
  }

  loadZoneDetails(): void {
    const id = this.zoneId();

    if (!id) {
      this.error.set('Zone id is missing');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      zoneRes: this.zoneService.getZoneById(id).pipe(
        catchError((err) => {
          console.error('getZoneById error:', err);
          return of(null);
        })
      ),
      devicesRes: this.zoneService.getDevicesByZone(id).pipe(
        catchError((err) => {
          console.error('getDevicesByZone error:', err);
          return of([]);
        })
      ),
      employeesRes: this.employeeService.getEmployeesByZone(id).pipe(
        catchError((err) => {
          console.error('getEmployeesByZone error:', err);
          return of([]);
        })
      ),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe(({ zoneRes, devicesRes, employeesRes }) => {
        const rawZone = zoneRes;

        if (!rawZone) {
          this.error.set('Zone not found');
          this.zone.set(null);
          return;
        }

        const fallbackDevices = Array.isArray((rawZone as any).devices)
          ? this.mapDevices((rawZone as any).devices)
          : [];

        const fallbackEmployees = Array.isArray((rawZone as any).employees)
          ? this.mapEmployees((rawZone as any).employees)
          : [];

        const mappedZone: ZoneModel = {
          _id: rawZone._id,
          name: rawZone.name,
          description: rawZone.description,
          riskLevel: rawZone.riskLevel,
          isActive: rawZone.isActive,
          createdAt: rawZone.createdAt,
          updatedAt: rawZone.updatedAt,
          temperature: (rawZone as any).temperature ?? null,
          humidity: (rawZone as any).humidity ?? null,
          alertsCount: (rawZone as any).alertsCount ?? 0,
          sensors: this.mapSensors((rawZone as any).sensors ?? []),
          devices: devicesRes?.length ? this.mapDevices(devicesRes) : fallbackDevices,
          employees: employeesRes?.length ? this.mapEmployees(employeesRes) : fallbackEmployees,
        };

        this.zone.set(mappedZone);
      });
  }

  private mapDevices(items: Device[] | any[]): ZoneDevice[] {
    return (items ?? []).map((d: any) => ({
      _id: d._id ?? d.id ?? d.deviceId ?? '',
      name: d.name || d.deviceId || 'Unnamed device',
      deviceId: d.deviceId || '—',
      status: this.normalizeStatus(d.status),
    }));
  }

  private mapEmployees(items: Employee[] | any[]): ZoneEmployee[] {
    return (items ?? []).map((e: any) => ({
      _id: e._id ?? '',
      fullName: e.fullName || '—',
      department: e.department || '',
      jobTitle: e.jobTitle || '',
      isActive: e.isActive ?? false,
    }));
  }

  private mapSensors(items: any[]): ZoneSensor[] {
    return (items ?? []).map((s: any) => ({
      _id: s._id ?? '',
      name: s.name || '—',
      type: s.type || 'unknown',
      status: this.normalizeStatus(s.status),
    }));
  }

  private normalizeStatus(
    status: string | undefined
  ): 'online' | 'offline' | 'maintenance' {
    const v = String(status ?? 'offline').toLowerCase();
    if (v === 'online') return 'online';
    if (v === 'maintenance') return 'maintenance';
    return 'offline';
  }

  back(): void {
    this.router.navigate(['/admin/zones']);
  }

  edit(): void {
    const z = this.zone();
    if (!z?._id) return;
    this.router.navigate(['/admin/zones/edit', z._id]);
  }

  riskKey(level: string | undefined): string {
    return `ZONES.RISK.${String(level ?? 'low').toLowerCase()}`;
  }

  riskClass(level: string | undefined): string {
    const v = String(level ?? 'low').toLowerCase();
    if (v === 'low') return 'ok';
    if (v === 'medium') return 'warn';
    return 'bad';
  }

  statusKey(active: boolean | undefined): string {
    return active
      ? 'ZONES.OVERVIEW.STATUS.active'
      : 'ZONES.OVERVIEW.STATUS.inactive';
  }

  deviceStatusKey(status: string | undefined): string {
    return `DEVICES.STATUS.${String(status ?? 'offline').toLowerCase()}`;
  }

  sensorStatusKey(status: string | undefined): string {
    return `SENSORS.STATUS.${String(status ?? 'offline').toLowerCase()}`;
  }

  employeeStatusKey(active: boolean | undefined): string {
    return active
      ? 'EMPLOYEES.STATUS.ACTIVE'
      : 'EMPLOYEES.STATUS.INACTIVE';
  }

  badgeClass(status: string | undefined): string {
    const v = String(status ?? '').toLowerCase();
    if (v === 'online' || v === 'active') return 'ok';
    if (v === 'maintenance' || v === 'warning') return 'warn';
    return 'bad';
  }

  value(v: any): string {
    return v === null || v === undefined || v === '' ? '—' : String(v);
  }

  sensorTypeKey(type: string | undefined): string {
    return `SENSORS.TYPE.${String(type ?? 'unknown').toLowerCase()}`;
  }

  trackById = (_: number, item: { _id: string }) => item._id;
}