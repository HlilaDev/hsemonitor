import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { catchError, finalize, of } from 'rxjs';

import {
  Sensor,
  SensorServices,
  SensorStatus,
} from '../../../../core/services/sensors/sensor-services';

@Component({
  selector: 'app-all-sensors',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './all-sensors.html',
  styleUrl: './all-sensors.scss',
})
export class AllSensors {
  private sensorService = inject(SensorServices);

  loading = signal(false);
  error = signal<string | null>(null);

  // filters
  q = signal('');
  zone = signal('');
  type = signal('');
  status = signal('');

  // data
  sensors = signal<Sensor[]>([]);

  // pagination côté client
  page = signal(1);
  pageSize = signal(10);

  total = computed(() => this.sensors().length);
  pages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));

  pagedSensors = computed(() => {
    const start = (this.page() - 1) * this.pageSize();
    return this.sensors().slice(start, start + this.pageSize());
  });

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set(null);

    this.sensorService
      .list({
        q: this.q().trim() || undefined,
        zone: this.zone() || undefined,
        type: this.type() || undefined,
        status: this.status() || undefined,
      })
      .pipe(
        catchError((err) => {
          this.error.set(err?.error?.message ?? 'Erreur lors du chargement des capteurs');
          return of([] as Sensor[]);
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe((items) => {
        this.sensors.set(items ?? []);
        this.page.set(1);
      });
  }

  onSearch() {
    this.page.set(1);
    this.load();
  }

  clearFilters() {
    this.q.set('');
    this.zone.set('');
    this.type.set('');
    this.status.set('');
    this.page.set(1);
    this.load();
  }

  prev() {
    if (this.page() > 1) this.page.update((v) => v - 1);
  }

  next() {
    if (this.page() < this.pages()) this.page.update((v) => v + 1);
  }

  // ✅ device est un objet populé { name, deviceId } ou un string ID
  deviceName(s: Sensor): string {
    const d: any = (s as any).device;
    if (!d) return '—';
    if (typeof d === 'object') return d?.name ?? d?.deviceId ?? d?._id ?? '—';
    return String(d);
  }

  // zone est un objet populé { name } ou un string ID
  zoneName(s: Sensor): string {
    const z: any = s.zone;
    if (!z) return '—';
    if (typeof z === 'object') return z?.name ?? z?._id ?? '—';
    return String(z);
  }

  badgeClass(status: SensorStatus | string): string {
    if (status === 'online') return 'ok';
    if (status === 'maintenance') return 'warn';
    return 'bad';
  }

  deleteSensor(s: Sensor) {
    if (!confirm(`Supprimer le capteur "${s.name}" ?`)) return;

    this.loading.set(true);
    this.error.set(null);

    this.sensorService
      .delete(s._id)
      .pipe(
        catchError((err) => {
          this.error.set(err?.error?.message ?? 'Suppression échouée');
          return of(null);
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe((res) => {
        if (res === null) return;
        const next = this.sensors().filter((x) => x._id !== s._id);
        this.sensors.set(next);
        if (this.page() > this.pages()) this.page.set(this.pages());
      });
  }

  toggleStatus(s: Sensor) {
    const next: SensorStatus = s.status === 'online' ? 'offline' : 'online';

    this.loading.set(true);
    this.error.set(null);

    this.sensorService
      .updateStatus(s._id, next)
      .pipe(
        catchError((err) => {
          this.error.set(err?.error?.message ?? 'Update status échoué');
          return of(null);
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe((updated) => {
        if (!updated) return;
        this.sensors.update((arr) =>
          arr.map((x) => (x._id === s._id ? updated : x))
        );
      });
  }
}