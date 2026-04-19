import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { ZoneServices, Zone } from '../../../../core/services/zones/zone-services';

@Component({
  selector: 'app-all-zones',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './all-zones.html',
  styleUrl: './all-zones.scss',
})
export class AllZones {
  private zoneService = inject(ZoneServices);
  private t = inject(TranslateService);

  zones: Zone[] = [];
  loading = true;
  errorMessageKey = '';

  q = signal('');
  risk = signal('');
  activeFilter = signal('');

  page = signal(1);
  pageSize = signal(8);

  constructor() {
    this.loadZones();
  }

  trackById = (_: number, z: any) => z?._id || z?.id;

  getRowId(z: any): string {
    return z?._id || z?.id || '';
  }

  riskKey(z: any): string {
    return 'ZONES.RISK.' + (z?.riskLevel ?? 'low');
  }

  riskClass(z: any): string {
    const r = z?.riskLevel;
    if (r === 'high') return 'high';
    if (r === 'medium') return 'medium';
    return 'low';
  }

  filteredZones = computed(() => {
    const search = this.q().trim().toLowerCase();
    const risk = this.risk();
    const activeFilter = this.activeFilter();

    return this.zones.filter((z: any) => {
      const matchesSearch =
        !search ||
        (z?.name || '').toLowerCase().includes(search) ||
        (z?.description || '').toLowerCase().includes(search);

      const matchesRisk = !risk || z?.riskLevel === risk;

      const matchesActive =
        !activeFilter ||
        (activeFilter === 'active' && z?.isActive === true) ||
        (activeFilter === 'inactive' && z?.isActive === false);

      return matchesSearch && matchesRisk && matchesActive;
    });
  });

  total = computed(() => this.filteredZones().length);

  pages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));

  pagedZones = computed(() => {
    const start = (this.page() - 1) * this.pageSize();
    return this.filteredZones().slice(start, start + this.pageSize());
  });

  loadZones() {
    this.loading = true;
    this.errorMessageKey = '';

    this.zoneService.getAllZones().subscribe({
      next: (res: any) => {
        this.zones = res?.items ?? res?.zones ?? res ?? [];
        this.loading = false;
        this.page.set(1);
      },
      error: () => {
        this.errorMessageKey = 'ZONES.ERROR.LOAD';
        this.loading = false;
      },
    });
  }

  onSearch(): void {
    this.page.set(1);
  }

  clearFilters(): void {
    this.q.set('');
    this.risk.set('');
    this.activeFilter.set('');
    this.page.set(1);
  }

  prev(): void {
    if (this.page() > 1) {
      this.page.update(v => v - 1);
    }
  }

  next(): void {
    if (this.page() < this.pages()) {
      this.page.update(v => v + 1);
    }
  }

  toggleActive(zone: any) {
    const id = this.getRowId(zone);
    const nextValue = !zone.isActive;

    zone.isActive = nextValue;

    this.zoneService.toggleActive(id, nextValue).subscribe({
      next: () => {},
      error: () => {
        zone.isActive = !nextValue;
        alert(this.t.instant('ZONES.ERROR.TOGGLE_ACTIVE'));
      },
    });
  }

  deleteZone(zone: any) {
    const id = this.getRowId(zone);
    const msg = this.t.instant('ZONES.CONFIRM_DELETE');

    if (!confirm(msg)) return;

    this.zoneService.deleteZone(id).subscribe({
      next: () => {
        this.zones = this.zones.filter(z => this.getRowId(z) !== id);

        if (this.page() > this.pages()) {
          this.page.set(this.pages());
        }
      },
      error: () => alert(this.t.instant('ZONES.ERROR.DELETE')),
    });
  }
}
