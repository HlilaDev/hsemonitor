import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';

import {
  TrainingServices,
  TrainingCategory,
  TrainingStatus,
} from '../../../../core/services/trainings/training-services';

type ParticipantStatus = 'planned' | 'attended' | 'passed' | 'failed';

type TrainingParticipant = {
  _id?: string;
  employee?:
    | string
    | {
        _id?: string;
        firstName?: string;
        lastName?: string;
        fullName?: string;
        name?: string;
      };
  status?: ParticipantStatus;
  score?: number;
  validUntil?: string | Date;
  note?: string;
};

type TrainingItem = {
  _id: string;
  title: string;
  description?: string;
  category: TrainingCategory;
  provider?: string;
  location?: string;
  startDate: string | Date;
  endDate?: string | Date;
  status: TrainingStatus;
  participants?: TrainingParticipant[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

type SortKey = 'startDate_asc' | 'startDate_desc' | 'title_asc' | 'title_desc';

@Component({
  selector: 'app-trainings-overview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './trainings-overview.html',
  styleUrl: './trainings-overview.scss',
})
export class TrainingsOverview {
  private trainingService = inject(TrainingServices);
  private router = inject(Router);

  loading = signal(true);
  errorMsg = signal<string | null>(null);

  trainings = signal<TrainingItem[]>([]);

  q = signal('');
  status = signal<'all' | TrainingStatus>('all');
  category = signal<'all' | TrainingCategory>('all');
  sort = signal<SortKey>('startDate_asc');

  readonly visibleItems = computed(() => {
    const search = this.q().trim().toLowerCase();
    const currentStatus = this.status();
    const currentCategory = this.category();
    const sort = this.sort();

    let list = [...this.trainings()];

    if (search) {
      list = list.filter(
        (item) =>
          (item.title || '').toLowerCase().includes(search) ||
          (item.description || '').toLowerCase().includes(search) ||
          (item.provider || '').toLowerCase().includes(search) ||
          (item.location || '').toLowerCase().includes(search)
      );
    }

    if (currentStatus !== 'all') {
      list = list.filter((item) => item.status === currentStatus);
    }

    if (currentCategory !== 'all') {
      list = list.filter((item) => item.category === currentCategory);
    }

    list.sort((a, b) => {
      switch (sort) {
        case 'startDate_desc':
          return this.toTime(b.startDate) - this.toTime(a.startDate);
        case 'startDate_asc':
          return this.toTime(a.startDate) - this.toTime(b.startDate);
        case 'title_asc':
          return (a.title || '').localeCompare(b.title || '');
        case 'title_desc':
          return (b.title || '').localeCompare(a.title || '');
      }
    });

    return list;
  });

  readonly plannedCount = computed(
    () => this.trainings().filter((item) => item.status === 'scheduled').length
  );

  readonly completedCount = computed(
    () => this.trainings().filter((item) => item.status === 'completed').length
  );

  readonly cancelledCount = computed(
    () => this.trainings().filter((item) => item.status === 'cancelled').length
  );

  readonly participantCount = computed(() =>
    this.trainings().reduce(
      (total, item) => total + (item.participants?.length ?? 0),
      0
    )
  );

  readonly upcomingItems = computed(() => {
    const now = Date.now();

    return this.visibleItems()
      .filter((item) => this.toTime(item.startDate) >= now)
      .slice(0, 4);
  });

  readonly recentCompletedItems = computed(() => {
    return this.visibleItems()
      .filter((item) => item.status === 'completed')
      .slice(0, 4);
  });

  readonly statusOptions: Array<{ value: 'all' | TrainingStatus; label: string }> =
    [
      { value: 'all', label: 'Tous les statuts' },
      { value: 'scheduled', label: 'Planifiée' },
      { value: 'completed', label: 'Terminée' },
      { value: 'cancelled', label: 'Annulée' },
    ];

  readonly categoryOptions: Array<{
    value: 'all' | TrainingCategory;
    label: string;
  }> = [
    { value: 'all', label: 'Toutes les catégories' },
    { value: 'safety', label: 'Safety' },
    { value: 'environment', label: 'Environment' },
    { value: 'quality', label: 'Quality' },
    { value: 'security', label: 'Security' },
    { value: 'other', label: 'Other' },
  ];

  ngOnInit(): void {
    this.fetchTrainings();
  }

  fetchTrainings(): void {
    this.loading.set(true);
    this.errorMsg.set(null);

    this.trainingService
      .getAllTrainings()
      .pipe(
        catchError((err) => {
          console.error('Trainings overview error:', err);
          this.errorMsg.set(
            err?.error?.message || 'Erreur lors du chargement des formations.'
          );
          return of([]);
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe((response: any) => {
        const list = Array.isArray(response)
          ? response
          : response?.items || response?.data || [];

        this.trainings.set(list);
      });
  }

  resetFilters(): void {
    this.q.set('');
    this.status.set('all');
    this.category.set('all');
    this.sort.set('startDate_asc');
  }

  goToTraining(id: string): void {
    this.router.navigate(['/agent/trainings', id]);
  }

  goToAllTrainings(): void {
    this.router.navigate(['/agent/trainings/list']);
  }

  updateStatusLabel(status: TrainingStatus): string {
    switch (status) {
      case 'scheduled':
        return 'Planifiée';
      case 'completed':
        return 'Terminée';
      case 'cancelled':
        return 'Annulée';
    }
  }

  categoryLabel(category: TrainingCategory): string {
    switch (category) {
      case 'safety':
        return 'Safety';
      case 'environment':
        return 'Environment';
      case 'quality':
        return 'Quality';
      case 'security':
        return 'Security';
      case 'other':
        return 'Other';
    }
  }

  participantStatusLabel(status?: ParticipantStatus): string {
    switch (status) {
      case 'planned':
        return 'Prévu';
      case 'attended':
        return 'Présent';
      case 'passed':
        return 'Réussi';
      case 'failed':
        return 'Échoué';
      default:
        return '—';
    }
  }

  trainingBadgeClass(status: TrainingStatus): string {
    if (status === 'scheduled') return 'badge scheduled';
    if (status === 'completed') return 'badge completed';
    return 'badge cancelled';
  }

  getParticipantsCount(item: TrainingItem): number {
    return item.participants?.length ?? 0;
  }

  getPresentCount(item: TrainingItem): number {
    return (
      item.participants?.filter(
        (participant) =>
          participant.status === 'attended' || participant.status === 'passed'
      ).length ?? 0
    );
  }

  getAbsentCount(item: TrainingItem): number {
    return (
      item.participants?.filter((participant) => participant.status === 'failed')
        .length ?? 0
    );
  }

  formatDate(value?: string | Date): string {
    if (!value) return '—';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';

    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  formatDateTime(value?: string | Date): string {
    if (!value) return '—';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';

    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private toTime(value?: string | Date): number {
    if (!value) return 0;

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
  }
}