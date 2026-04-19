import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { of, switchMap } from 'rxjs';

import {
  ObservationService,
  ObservationSeverity,
  ObservationStatus,
} from '../../../../core/services/observations/observation-services';

import { AuthServices, User } from '../../../../core/services/auth/auth-services';

type ObservationItem = {
  _id: string;
  title: string;
  description: string;
  severity: ObservationSeverity;
  status: ObservationStatus;
  zone?: { _id: string; name: string };
  images?: { url: string }[];
  createdAt?: string;
};

@Component({
  selector: 'app-my-observations',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-observations.html',
  styleUrl: './my-observations.scss',
})
export class MyObservations {
  private auth = inject(AuthServices);
  private obsService = inject(ObservationService);

  loading = signal(false);
  errorMsg = signal<string | null>(null);
  me = signal<User | null>(null);

  items = signal<ObservationItem[]>([]);
  total = signal(0);
  pages = signal(1);

  q = signal('');
  status = signal('');
  severity = signal('');

  page = signal(1);
  limit = signal(10);

  readonly severityOptions: ObservationSeverity[] = ['low', 'medium', 'high', 'critical'];
  readonly statusOptions: ObservationStatus[] = ['open', 'in_progress', 'closed'];

  constructor() {
    this.loadMeAndData();
  }

  private loadMeAndData() {
    this.loading.set(true);

    this.auth.me().pipe(
      switchMap((res: any) => {
        this.me.set(res.user);
        const userId = res.user?._id;
        if (!userId) return of({ items: [], meta: {} });
        return this.listMyObservations(userId);
      })
    ).subscribe({
      next: (res: any) => {
        this.items.set(res?.items ?? res?.observations ?? []);
        this.total.set(res?.meta?.total ?? 0);
        this.pages.set(res?.meta?.pages ?? 1);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.errorMsg.set('Erreur de chargement.');
      }
    });
  }

  private listMyObservations(userId: string) {
    return this.obsService.list({
      reportedBy: userId,
      q: this.q(),
      status: this.status(),
      severity: this.severity(),
      page: this.page(),
      limit: this.limit(),
    });
  }

  reload() {
    const userId = this.me()?._id;
    if (!userId) return;
    this.listMyObservations(userId).subscribe((res: any) => {
      this.items.set(res?.items ?? res?.observations ?? []);
      this.total.set(res?.meta?.total ?? 0);
      this.pages.set(res?.meta?.pages ?? 1);
    });
  }

  onSearch(value: string) {
    this.q.set(value);
    this.page.set(1);
    this.reload();
  }

  onStatus(value: string) {
    this.status.set(value);
    this.page.set(1);
    this.reload();
  }

  onSeverity(value: string) {
    this.severity.set(value);
    this.page.set(1);
    this.reload();
  }

  onLimit(value: string) {
    this.limit.set(Number(value));
    this.page.set(1);
    this.reload();
  }

  nextPage() {
    if (this.page() < this.pages()) {
      this.page.update(p => p + 1);
      this.reload();
    }
  }

  prevPage() {
    if (this.page() > 1) {
      this.page.update(p => p - 1);
      this.reload();
    }
  }

  trackById = (_: number, it: ObservationItem) => it._id;

  formatDate(iso?: string) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString();
  }
}