import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TemplateItem } from '../template-item/template-item';
import {
  ChecklistCategory,
  ChecklistItem,
  ChecklistServices,
  ChecklistTemplate,
} from '../../../../../core/services/checklist/checklist-services';

@Component({
  selector: 'app-template-details',
  standalone: true,
  imports: [CommonModule, RouterModule, TemplateItem],
  templateUrl: './template-details.html',
  styleUrl: './template-details.scss',
})
export class TemplateDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly checklistService = inject(ChecklistServices);

  loading = signal(true);
  errorMsg = signal('');
  template = signal<ChecklistTemplate | null>(null);
  items = signal<ChecklistItem[]>([]);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.errorMsg.set('Template introuvable.');
      this.loading.set(false);
      return;
    }

    this.loadTemplate(id);
  }

  loadTemplate(id: string): void {
    this.loading.set(true);
    this.errorMsg.set('');

    this.checklistService.getTemplateById(id).subscribe({
      next: (response) => {
        this.template.set(response);
        this.items.set(
          [...(response.items ?? [])].sort(
            (a, b) => (a.order ?? 0) - (b.order ?? 0)
          )
        );
        this.loading.set(false);
      },
      error: (error) => {
        console.error('getTemplateById error:', error);
        this.errorMsg.set(
          error?.error?.message || 'Erreur lors du chargement du template.'
        );
        this.loading.set(false);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/manager/inspections/templates']);
  }

  editTemplate(): void {
    const id = this.template()?._id;
    if (!id) return;

    this.router.navigate(['/manager/inspections/templates/edit', id]);
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

  statusLabel(): string {
    return this.template()?.isActive === false ? 'Inactif' : 'Actif';
  }

  statusClass(): string {
    return this.template()?.isActive === false
      ? 'badge inactive'
      : 'badge active';
  }

  createdByLabel(): string {
    const createdBy = this.template()?.createdBy;

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
}