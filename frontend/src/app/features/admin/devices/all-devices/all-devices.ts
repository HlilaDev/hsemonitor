import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { catchError, finalize, of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

import {
  DeviceServices,
  Device,
} from '../../../../core/services/devices/device-services';
import { ConfirmModalService } from '../../../../core/services/confirm-modal/confirm-modal.service';
import { ToastService } from '../../../../core/services/toast/toast.service';

@Component({
  selector: 'app-all-devices',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslateModule],
  providers: [DatePipe],
  templateUrl: './all-devices.html',
  styleUrl: './all-devices.scss',
})
export class AllDevices {
  private deviceService = inject(DeviceServices);
  private datePipe = inject(DatePipe);
  private confirmModal = inject(ConfirmModalService);
  private toast = inject(ToastService);

  loading = signal(false);
  error = signal<string | null>(null);

  q = signal('');
  zone = signal('');
  status = signal('');

  devices = signal<Device[]>([]);
  page = signal(1);
  pageSize = signal(10);

  filteredDevices = computed(() => {
    let list = [...this.devices()];

    const q = this.q().trim().toLowerCase();
    const zone = this.zone().trim().toLowerCase();
    const status = this.status().trim().toLowerCase();

    if (q) {
      list = list.filter((d: any) => {
        return (
          String(d?.name ?? '').toLowerCase().includes(q) ||
          String(d?.deviceId ?? '').toLowerCase().includes(q)
        );
      });
    }

    if (zone) {
      list = list.filter((d: any) =>
        this.getZoneName(d).toLowerCase().includes(zone)
      );
    }

    if (status) {
      list = list.filter(
        (d: any) => String(d?.status ?? '').toLowerCase() === status
      );
    }

    return list;
  });

  total = computed(() => this.devices().length);
  filteredTotal = computed(() => this.filteredDevices().length);

  onlineCount = computed(
    () => this.devices().filter((d: any) => d?.status === 'online').length
  );

  offlineCount = computed(
    () => this.devices().filter((d: any) => d?.status === 'offline').length
  );

  maintenanceCount = computed(
    () => this.devices().filter((d: any) => d?.status === 'maintenance').length
  );

  pages = computed(() =>
    Math.max(1, Math.ceil(this.filteredTotal() / this.pageSize()))
  );

  pagedDevices = computed(() => {
    const start = (this.page() - 1) * this.pageSize();
    return this.filteredDevices().slice(start, start + this.pageSize());
  });

  ngOnInit(): void {
    this.loadDevices();
  }

  trackByDevice = (_: number, d: any) => d?._id || d?.deviceId;

  loadDevices(): void {
    this.loading.set(true);
    this.error.set(null);

    this.deviceService
      .getAllDevices()
      .pipe(
        catchError((err) => {
          this.error.set(err?.error?.message ?? 'Erreur de chargement des devices');
          return of([] as Device[]);
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe((res: any) => {
        const items = res?.items ?? res?.devices ?? res ?? [];
        this.devices.set(Array.isArray(items) ? items : []);
        this.page.set(1);
      });
  }

  onSearch(): void {
    this.page.set(1);
  }

  clearFilters(): void {
    this.q.set('');
    this.zone.set('');
    this.status.set('');
    this.page.set(1);
  }

  prev(): void {
    if (this.page() > 1) this.page.update((v) => v - 1);
  }

  next(): void {
    if (this.page() < this.pages()) this.page.update((v) => v + 1);
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

  formatLastSeen(value: any): string {
    if (!value) return '—';
    return this.datePipe.transform(value, 'dd/MM/yyyy HH:mm') ?? '—';
  }

  badgeClass(status: string | undefined): string {
    if (status === 'online') return 'ok';
    if (status === 'maintenance') return 'warn';
    return 'bad';
  }

  restartDevice(id: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.deviceService
      .restartDevice(id)
      .pipe(
        catchError((err) => {
          this.error.set(err?.error?.message ?? 'Erreur de redémarrage');
          return of(null);
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe();
  }

  deleteDevice(id: string, name?: string): void {
    this.confirmModal.open({
      message: 'Êtes-vous sûr de vouloir supprimer ce device ?',
      itemName: name,
      onConfirm: () => {
        this.loading.set(true);
        this.error.set(null);

        this.deviceService
          .deleteDevice(id)
          .pipe(
            catchError((err) => {
              this.toast.error(err?.error?.message ?? 'Erreur de suppression');
              return of(null);
            }),
            finalize(() => this.loading.set(false))
          )
          .subscribe((res) => {
            if (res === null) return;
            this.devices.set(this.devices().filter((d: any) => d?._id !== id && d?.deviceId !== id));
            if (this.page() > this.pages()) this.page.set(this.pages());
            this.toast.success('Device supprimé avec succès.');
          });
      },
    });
  }
}