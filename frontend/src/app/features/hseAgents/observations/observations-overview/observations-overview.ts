import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';

import {
  ObservationService,
  ObservationSeverity,
  ObservationStatus,
} from '../../../../core/services/observations/observation-services';

import { AuthServices, User } from '../../../../core/services/auth/auth-services';

type ViewScope = 'mine' | 'reported' | 'assigned';

type ObservationUserRef =
  | string
  | {
      _id: string;
      fullName?: string;
      firstName?: string;
      lastName?: string;
      name?: string;
      email?: string;
      role?: string;
    }
  | null
  | undefined;

type ObservationItem = {
  _id: string;
  title: string;
  description: string;
  severity: ObservationSeverity;
  status: ObservationStatus;
  zone?: { _id: string; name: string };
  reportedBy?: ObservationUserRef;
  assignedTo?: ObservationUserRef;
  assignedBy?: ObservationUserRef;
  createdAt?: string;
};

@Component({
  selector: 'app-observations-overview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './observations-overview.html',
  styleUrl: './observations-overview.scss',
})
export class ObservationsOverview {
  private auth = inject(AuthServices);
  private obsService = inject(ObservationService);

  loading = signal(false);
  errorMsg = signal<string | null>(null);
  me = signal<User | null>(null);

  scope = signal<ViewScope>('mine');

  items = signal<ObservationItem[]>([]);

  q = signal('');
  status = signal('');
  severity = signal('');

  page = signal(1);
  limit = signal(10);

  readonly fetchLimit = 300;

  readonly scopeTabs: { value: ViewScope; label: string; hint: string }[] = [
    {
      value: 'mine',
      label: 'Toutes mes observations',
      hint: 'Déclarées par moi ou affectées à moi',
    },
    {
      value: 'reported',
      label: 'Déclarées par moi',
      hint: 'Observations que j’ai créées',
    },
    {
      value: 'assigned',
      label: 'Affectées à moi',
      hint: 'Observations à traiter',
    },
  ];

  readonly severityOptions: ObservationSeverity[] = [
    'low',
    'medium',
    'high',
    'critical',
  ];

  readonly statusOptions: ObservationStatus[] = [
    'open',
    'in_progress',
    'closed',
  ];

  readonly total = computed(() => this.items().length);

  readonly pages = computed(() => {
    const total = this.total();
    const size = this.limit();
    return Math.max(1, Math.ceil(total / size));
  });

  readonly pagedItems = computed(() => {
    const currentPage = Math.min(this.page(), this.pages());
    const start = (currentPage - 1) * this.limit();
    const end = start + this.limit();
    return this.items().slice(start, end);
  });

  readonly currentScopeLabel = computed(() => {
    return (
      this.scopeTabs.find((tab) => tab.value === this.scope())?.label ??
      'Observations'
    );
  });

  readonly currentScopeHint = computed(() => {
    return this.scopeTabs.find((tab) => tab.value === this.scope())?.hint ?? '';
  });

  constructor() {
    this.loadMe();
  }

  private loadMe() {
    this.loading.set(true);
    this.errorMsg.set(null);

    this.auth.me().subscribe({
      next: (res) => {
        this.me.set(res?.user ?? null);
        this.reload();
      },
      error: () => {
        this.loading.set(false);
        this.errorMsg.set("Impossible de charger l'utilisateur connecté.");
      },
    });
  }

  private baseFilters() {
    return {
      q: this.q(),
      status: this.status(),
      severity: this.severity(),
      page: 1,
      limit: this.fetchLimit,
    };
  }

  reload() {
    const userId = this.me()?._id;

    if (!userId) {
      this.loading.set(false);
      this.items.set([]);
      this.errorMsg.set('Utilisateur introuvable.');
      return;
    }

    this.loading.set(true);
    this.errorMsg.set(null);

    const filters = this.baseFilters();
    const currentScope = this.scope();

    if (currentScope === 'reported') {
      this.obsService
        .list({
          ...filters,
          reportedBy: userId,
        })
        .subscribe({
          next: (res: any) => {
            this.setItems(this.normalizeItems(res));
          },
          error: () => {
            this.loading.set(false);
            this.errorMsg.set(
              'Erreur lors du chargement des observations déclarées.'
            );
          },
        });
      return;
    }

    if (currentScope === 'assigned') {
      this.obsService
        .list({
          ...filters,
          assignedTo: userId,
        })
        .subscribe({
          next: (res: any) => {
            this.setItems(this.normalizeItems(res));
          },
          error: () => {
            this.loading.set(false);
            this.errorMsg.set(
              'Erreur lors du chargement des observations affectées.'
            );
          },
        });
      return;
    }

    forkJoin({
      reported: this.obsService.list({
        ...filters,
        reportedBy: userId,
      }),
      assigned: this.obsService.list({
        ...filters,
        assignedTo: userId,
      }),
    }).subscribe({
      next: ({ reported, assigned }: any) => {
        const reportedItems = this.normalizeItems(reported);
        const assignedItems = this.normalizeItems(assigned);

        const map = new Map<string, ObservationItem>();

        for (const item of reportedItems) {
          map.set(item._id, item);
        }

        for (const item of assignedItems) {
          map.set(item._id, item);
        }

        const merged = Array.from(map.values()).sort((a, b) => {
          const da = new Date(a.createdAt || 0).getTime();
          const db = new Date(b.createdAt || 0).getTime();
          return db - da;
        });

        this.setItems(merged);
      },
      error: () => {
        this.loading.set(false);
        this.errorMsg.set('Erreur lors du chargement des observations.');
      },
    });
  }

  private normalizeItems(res: any): ObservationItem[] {
    return (res?.items ?? res?.observations ?? []) as ObservationItem[];
  }

  private setItems(items: ObservationItem[]) {
    this.items.set(items);

    const maxPages = this.pages();
    if (this.page() > maxPages) {
      this.page.set(maxPages);
    }

    this.loading.set(false);
  }

  onScope(scope: ViewScope) {
    if (this.scope() === scope) return;
    this.scope.set(scope);
    this.page.set(1);
    this.reload();
  }

  onSearch(value: string) {
    this.q.set(value.trim());
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
    this.limit.set(Number(value) || 10);
    this.page.set(1);
  }

  nextPage() {
    if (this.page() < this.pages()) {
      this.page.update((p) => p + 1);
    }
  }

  prevPage() {
    if (this.page() > 1) {
      this.page.update((p) => p - 1);
    }
  }

  getUserDisplayName(user: ObservationUserRef): string {
    if (!user) return '—';

    if (typeof user === 'string') return user;

    return (
      user.fullName ||
      user.name ||
      `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
      user.email ||
      '—'
    );
  }

  formatDate(iso?: string) {
    if (!iso) return '—';

    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '—';

    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
  }

  trackById = (_: number, item: ObservationItem) => item._id;
}