import { Component, DestroyRef, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';

import { ReportServices } from '../../../../core/services/reports/report-services';
import { ZoneServices } from '../../../../core/services/zones/zone-services';
import { BASE_URL } from '../../../../core/config/api_urls';

type ZoneLite = { _id: string; name: string };

type ReportType = 'weekly' | 'monthly' | 'yearly' | 'audit' | 'custom';

type ZoneRef = string | { _id: string; name?: string };
type UserRef = string | { _id: string; name?: string };

type Report = {
  _id: string;
  type: ReportType;
  title?: string;

  startDate?: string | Date;
  endDate?: string | Date;

  zone?: ZoneRef | null;

  metrics?: {
    totalIncidents?: number;
    totalObservations?: number;
    complianceRate?: number;
  };

  generatedBy?: UserRef | null;

  isAutomatic?: boolean;
  exportUrl?: string;

  createdAt?: string;
};

@Component({
  selector: 'app-reports-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './reports-list.html',
  styleUrl: './reports-list.scss',
})
export class ReportsList implements OnInit {
  private destroyRef = inject(DestroyRef);
  private reportsApi = inject(ReportServices);
  private zonesApi = inject(ZoneServices);

  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  readonly reports = signal<Report[]>([]);
  readonly zones = signal<ZoneLite[]>([]);

  readonly q = signal<string>('');
  readonly type = signal<'all' | ReportType>('all');
  readonly zoneId = signal<'all' | string>('all');
  readonly sort = signal<'date_desc' | 'date_asc' | 'title_asc' | 'title_desc'>('date_desc');

  ngOnInit(): void {
    this.loadZones();
    this.loadReports();
  }

  refresh() {
    this.loadReports();
  }

  reset() {
    this.q.set('');
    this.type.set('all');
    this.zoneId.set('all');
    this.sort.set('date_desc');
  }

  setQ(v: string) {
    this.q.set(v ?? '');
  }

  setType(v: any) {
    this.type.set((v || 'all') as any);
  }

  setZone(v: any) {
    this.zoneId.set((v || 'all') as any);
  }

  setSort(v: any) {
    this.sort.set((v || 'date_desc') as any);
  }

  readonly filtered = computed(() => {
    const q = (this.q() || '').trim().toLowerCase();
    const type = this.type();
    const zoneId = this.zoneId();
    const sort = this.sort();

    let list = [...this.reports()];

    if (type !== 'all') {
      list = list.filter((r) => r.type === type);
    }

    if (zoneId !== 'all') {
      list = list.filter((r) => this.zoneIdOf(r.zone) === zoneId);
    }

    if (q) {
      list = list.filter((r) => {
        const title = (r.title || '').toLowerCase();
        const t = (r.type || '').toLowerCase();
        const zn = (this.zoneName(r.zone) || '').toLowerCase();
        return title.includes(q) || t.includes(q) || zn.includes(q);
      });
    }

    const getDate = (r: Report) =>
      new Date((r.createdAt || r.startDate || '') as any).getTime() || 0;

    const getTitle = (r: Report) => (r.title || '').toLowerCase();

    if (sort === 'date_desc') list.sort((a, b) => getDate(b) - getDate(a));
    if (sort === 'date_asc') list.sort((a, b) => getDate(a) - getDate(b));
    if (sort === 'title_asc') list.sort((a, b) => getTitle(a).localeCompare(getTitle(b)));
    if (sort === 'title_desc') list.sort((a, b) => getTitle(b).localeCompare(getTitle(a)));

    return list;
  });

  zoneIdOf(z: Report['zone']): string | null {
    if (!z) return null;
    return typeof z === 'string' ? z : (z._id ?? null);
  }

  zoneName(z: Report['zone']): string {
    if (!z) return '—';

    if (typeof z === 'string') {
      const found = this.zones().find((x) => x._id === z);
      return found?.name || '—';
    }

    if (z._id && !z.name) {
      const found = this.zones().find((x) => x._id === z._id);
      return found?.name || '—';
    }

    return z.name || '—';
  }

  userName(u: Report['generatedBy']): string {
    if (!u) return '—';
    if (typeof u === 'string') return '—';
    return u.name || '—';
  }

  getExportUrl(url?: string | null): string {
    if (!url) return '';

    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    const base = BASE_URL.replace(/\/+$/, '');
    const path = url.replace(/^\/+/, '');

    return `${base}/${path}`;
  }

  private loadReports() {
    this.loading.set(true);
    this.error.set(null);

    this.reportsApi
      .listReports()
      .pipe(
        catchError((err) => {
          this.error.set(err?.error?.message || 'Erreur lors du chargement des reports.');
          return of([]);
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe((data: any) => {
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
            ? data.items
            : Array.isArray(data?.reports)
              ? data.reports
              : [];
        this.reports.set(list);
      });
  }

  private loadZones() {
    const obs$ = (this.zonesApi as any).allZones
      ? (this.zonesApi as any).allZones()
      : (this.zonesApi as any).getAllZones
        ? (this.zonesApi as any).getAllZones()
        : null;

    if (!obs$) return;

    obs$
      .pipe(catchError(() => of([])))
      .subscribe((zs: any) => {
        const list = Array.isArray(zs) ? zs : (zs?.items ?? []);
        this.zones.set(list.map((z: any) => ({ _id: z._id, name: z.name })));
      });
  }

  remove(r: Report) {
    const ok = confirm('Supprimer ce rapport ?');
    if (!ok) return;

    this.reportsApi
      .deleteReport(r._id)
      .pipe(
        catchError((err) => {
          alert(err?.error?.message || 'Suppression impossible.');
          return of(null);
        })
      )
      .subscribe(() => {
        this.reports.update((list) => list.filter((x) => x._id !== r._id));
      });
  }

  recalcMetrics(r: Report) {
    this.reportsApi
      .updateReportMetrics(r._id, {})
      .pipe(
        catchError((err) => {
          alert(err?.error?.message || 'Recalcul impossible.');
          return of(null);
        })
      )
      .subscribe((updated: any) => {
        if (!updated) return;
        this.reports.update((list) =>
          list.map((x) => (x._id === r._id ? (updated as Report) : x))
        );
      });
  }

  badgeClass(type: ReportType) {
    if (type === 'weekly' || type === 'monthly') return 'scheduled';
    if (type === 'audit' || type === 'yearly') return 'completed';
    return 'cancelled';
  }

  formatPeriod(start: any, end: any) {
    const s = start ? new Date(start) : null;
    const e = end ? new Date(end) : null;

    const fmt = (d: Date) =>
      d.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
      });

    if (s && e) return `${fmt(s)} → ${fmt(e)}`;
    if (s) return fmt(s);
    return '—';
  }
}