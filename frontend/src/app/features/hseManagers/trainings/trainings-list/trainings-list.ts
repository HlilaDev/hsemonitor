import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';

import { TrainingServices } from '../../../../core/services/trainings/training-services';

type Category = 'safety' | 'environment' | 'quality' | 'security' | 'other';
type TrainingStatus = 'scheduled' | 'completed' | 'cancelled';

type Training = {
  _id: string;
  title: string;
  description?: string;
  category: Category;
  provider?: string;
  location?: string;
  startDate: string | Date;
  endDate?: string | Date;
  status: TrainingStatus;
  participants?: Array<any>;
};

type SortKey = 'startDate_desc' | 'startDate_asc' | 'title_asc' | 'title_desc';

@Component({
  selector: 'app-trainings-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './trainings-list.html',
  styleUrl: './trainings-list.scss',
})
export class TrainingsList {
  private trainingsService = inject(TrainingServices);
  private router = inject(Router);

  isLoading = signal(true);
  error = signal<string | null>(null);

  trainings = signal<Training[]>([]);

  q = signal('');
  category = signal<Category | 'all'>('all');
  status = signal<TrainingStatus | 'all'>('all');
  sort = signal<SortKey>('startDate_desc');

  filtered = computed(() => {
    const search = this.q().trim().toLowerCase();
    const category = this.category();
    const status = this.status();
    const sort = this.sort();

    let list = [...this.trainings()];

    if (search) {
      list = list.filter((t) =>
        (t.title || '').toLowerCase().includes(search) ||
        (t.description || '').toLowerCase().includes(search) ||
        (t.provider || '').toLowerCase().includes(search) ||
        (t.location || '').toLowerCase().includes(search)
      );
    }

    if (category !== 'all') {
      list = list.filter((t) => t.category === category);
    }

    if (status !== 'all') {
      list = list.filter((t) => t.status === status);
    }

    const toTime = (value: string | Date | undefined) =>
      value ? new Date(value).getTime() : 0;

    list.sort((a, b) => {
      switch (sort) {
        case 'startDate_asc':
          return toTime(a.startDate) - toTime(b.startDate);
        case 'startDate_desc':
          return toTime(b.startDate) - toTime(a.startDate);
        case 'title_asc':
          return (a.title || '').localeCompare(b.title || '');
        case 'title_desc':
          return (b.title || '').localeCompare(a.title || '');
      }
    });

    return list;
  });

  ngOnInit(): void {
    this.fetch();
  }

  fetch(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.trainingsService
      .getAllTrainings()
      .pipe(
        catchError((err) => {
          console.error('List trainings error:', err);
          this.error.set(
            err?.error?.message || 'Erreur lors du chargement des formations.'
          );
          return of({ items: [] });
        }),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe((response: any) => {
        const list = Array.isArray(response)
          ? response
          : response?.items || response?.data || [];

        this.trainings.set(list);
      });
  }

  categoryLabel(category: Category): string {
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

  statusLabel(status: TrainingStatus): string {
    switch (status) {
      case 'scheduled':
        return 'Prévu';
      case 'completed':
        return 'Terminé';
      case 'cancelled':
        return 'Annulé';
    }
  }

  badgeClass(status: TrainingStatus): string {
    return status === 'scheduled'
      ? 'badge scheduled'
      : status === 'completed'
      ? 'badge completed'
      : 'badge cancelled';
  }

  participantsCount(training: Training): number {
    return training.participants?.length ?? 0;
  }

  fmtDate(value: string | Date | undefined): string {
    if (!value) return '-';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';

    return date.toLocaleDateString();
  }

  goCreate(): void {
    this.router.navigate(['/manager/trainings/create']);
  }

  goDetail(id: string): void {
    this.router.navigate(['/manager/trainings', id]);
  }

  goEdit(id: string): void {
    this.router.navigate(['/manager/trainings', id, 'edit']);
  }

  deleteTraining(id: string): void {
    const ok = confirm('Supprimer cette formation ?');
    if (!ok) return;

    this.isLoading.set(true);
    this.error.set(null);

    this.trainingsService
      .deleteTraining(id)
      .pipe(
        catchError((err) => {
          console.error('Delete training error:', err);
          this.error.set(err?.error?.message || 'Suppression échouée.');
          return of(null);
        }),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe((res) => {
        if (!res) return;
        this.fetch();
      });
  }

  resetFilters(): void {
    this.q.set('');
    this.category.set('all');
    this.status.set('all');
    this.sort.set('startDate_desc');
  }
}