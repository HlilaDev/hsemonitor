import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';

import {
  ChecklistCategory,
  ChecklistServices,
  ChecklistTemplate,
} from '../../../../../core/services/checklist/checklist-services';


@Component({
  selector: 'app-templates-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './templates-list.html',
  styleUrl: './templates-list.scss',
})
export class TemplatesList {
  private checklistService = inject(ChecklistServices);
  private router = inject(Router);

  loading = signal(true);
  deletingId = signal<string | null>(null);
  errorMsg = signal('');
  successMsg = signal('');

  templates = signal<ChecklistTemplate[]>([]);

  search = signal('');
  selectedCategory = signal<'all' | ChecklistCategory>('all');
  selectedStatus = signal<'all' | 'active' | 'inactive'>('all');

  readonly filteredTemplates = computed(() => {
    const q = this.search().trim().toLowerCase();
    const category = this.selectedCategory();
    const status = this.selectedStatus();

    return this.templates().filter((template) => {
      const matchesSearch =
        !q ||
        template.title?.toLowerCase().includes(q) ||
        template.description?.toLowerCase().includes(q);

      const matchesCategory =
        category === 'all' || template.category === category;

      const isActive = template.isActive !== false;
      const matchesStatus =
        status === 'all' ||
        (status === 'active' && isActive) ||
        (status === 'inactive' && !isActive);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  });

  readonly totalCount = computed(() => this.templates().length);

  readonly activeCount = computed(
    () => this.templates().filter((item) => item.isActive !== false).length
  );

  readonly inactiveCount = computed(
    () => this.templates().filter((item) => item.isActive === false).length
  );

  ngOnInit(): void {
    this.loadTemplates();
  }

  loadTemplates(): void {
    this.loading.set(true);
    this.errorMsg.set('');
    this.successMsg.set('');

    this.checklistService
      .getAllTemplates()
      .pipe(
        catchError((error) => {
          console.error('loadTemplates error:', error);
          this.errorMsg.set(
            error?.error?.message ||
              'Erreur lors du chargement des templates.'
          );
          return of([]);
        }),
        finalize(() => {
          this.loading.set(false);
        })
      )
      .subscribe((templates) => {
        this.templates.set(Array.isArray(templates) ? templates : []);
      });
  }

  goToCreate(): void {
    this.router.navigate(['/manager/inspections/templates/new']);
  }

  openDetails(id?: string): void {
    if (!id) return;
    this.router.navigate(['/manager/inspections/templates', id]);
  }

  editTemplate(id?: string): void {
    if (!id) return;
    this.router.navigate(['/manager/inspections/templates', id, 'edit']);
  }

  deleteTemplate(template: ChecklistTemplate): void {
    if (!template?._id) return;

    const confirmed = window.confirm(
      `Supprimer le template "${template.title}" ?`
    );

    if (!confirmed) return;

    this.deletingId.set(template._id);
    this.errorMsg.set('');
    this.successMsg.set('');

    this.checklistService
      .deleteTemplate(template._id)
      .pipe(
        catchError((error) => {
          console.error('deleteTemplate error:', error);
          this.errorMsg.set(
            error?.error?.message ||
              'Erreur lors de la suppression du template.'
          );
          return of(null);
        }),
        finalize(() => {
          this.deletingId.set(null);
        })
      )
      .subscribe((response) => {
        if (!response) return;

        this.templates.update((list) =>
          list.filter((item) => item._id !== template._id)
        );

        this.successMsg.set('Template supprimé avec succès.');
      });
  }

  resetFilters(): void {
    this.search.set('');
    this.selectedCategory.set('all');
    this.selectedStatus.set('all');
  }

  categoryLabel(category?: ChecklistCategory): string {
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
      default:
        return '—';
    }
  }

  createdByLabel(
    createdBy?:
      | string
      | {
          _id?: string;
          firstName?: string;
          lastName?: string;
          fullName?: string;
          email?: string;
        }
  ): string {
    if (!createdBy) return '—';
    if (typeof createdBy === 'string') return 'Utilisateur';

    return (
      createdBy.fullName ||
      `${createdBy.firstName ?? ''} ${createdBy.lastName ?? ''}`.trim() ||
      createdBy.email ||
      'Utilisateur'
    );
  }

  formatDate(value?: string): string {
    if (!value) return '—';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';

    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  templateItemsCount(template: ChecklistTemplate): number {
    return template.items?.length ?? 0;
  }

  statusLabel(template: ChecklistTemplate): string {
    return template.isActive === false ? 'Inactif' : 'Actif';
  }

  statusClass(template: ChecklistTemplate): string {
    return template.isActive === false ? 'badge inactive' : 'badge active';
  }
}