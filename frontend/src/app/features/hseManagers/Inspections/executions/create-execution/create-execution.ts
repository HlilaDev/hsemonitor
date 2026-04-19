import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';

import {
  ChecklistServices,
  ChecklistTemplate,
} from '../../../../../core/services/checklist/checklist-services';

@Component({
  selector: 'app-create-execution',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './create-execution.html',
  styleUrl: './create-execution.scss',
})
export class CreateExecution {
  private readonly checklistService = inject(ChecklistServices);
  private readonly router = inject(Router);

  loading = signal(true);
  submitting = signal(false);
  errorMsg = signal<string | null>(null);

  templates = signal<ChecklistTemplate[]>([]);
  selectedTemplateId = signal<string | null>(null);

  title = signal('');
  notes = signal('');

  readonly selectedTemplate = computed(() => {
    const selectedId = this.selectedTemplateId();
    if (!selectedId) return null;

    return (
      this.templates().find((template) => template._id === selectedId) ?? null
    );
  });

  readonly hasTemplates = computed(() => this.templates().length > 0);

  readonly selectedTemplateItemsCount = computed(() => {
    const template = this.selectedTemplate();
    return template?.items?.length || 0;
  });

  readonly canSubmit = computed(() => {
    return (
      !!this.selectedTemplateId() &&
      !!this.title().trim() &&
      !this.submitting()
    );
  });

  ngOnInit(): void {
    this.loadTemplates();
  }

  loadTemplates(): void {
    this.loading.set(true);
    this.errorMsg.set(null);

    this.checklistService
      .getAllTemplates()
      .pipe(
        catchError((error) => {
          console.error('Templates load error:', error);
          this.errorMsg.set('Erreur lors du chargement des templates.');
          return of([]);
        }),
        finalize(() => {
          this.loading.set(false);
        })
      )
      .subscribe((templates) => {
        const safeTemplates = Array.isArray(templates) ? templates : [];
        const activeTemplates = safeTemplates.filter(
          (template) => template.isActive !== false
        );

        this.templates.set(activeTemplates);

        if (activeTemplates.length > 0 && !this.selectedTemplateId()) {
          this.selectedTemplateId.set(activeTemplates[0]._id);

          if (!this.title().trim()) {
            this.title.set(activeTemplates[0].title || '');
          }
        }
      });
  }

  selectTemplate(id?: string): void {
    if (!id || this.submitting()) return;

    this.selectedTemplateId.set(id);
    this.errorMsg.set(null);

    const template = this.templates().find((item) => item._id === id);
    if (template && !this.title().trim()) {
      this.title.set(template.title || '');
    }
  }

  updateTitle(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.title.set(value);
  }

  updateNotes(event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.notes.set(value);
  }

  createExecution(): void {
    const templateId = this.selectedTemplateId();
    const title = this.title().trim();

    if (!templateId) {
      this.errorMsg.set('Veuillez sélectionner un template.');
      return;
    }

    if (!title) {
      this.errorMsg.set("Le titre de l'inspection est obligatoire.");
      return;
    }

    if (this.submitting()) return;

    this.submitting.set(true);
    this.errorMsg.set(null);

    this.checklistService
      .startExecution({
        checklistId: templateId,
        title,
        notes: this.notes().trim(),
      })
      .pipe(
        finalize(() => {
          this.submitting.set(false);
        })
      )
      .subscribe({
        next: (response) => {
          const executionId = response?.execution?._id;

          if (!executionId) {
            this.errorMsg.set(
              "L'exécution a été créée mais son identifiant est introuvable."
            );
            return;
          }

          this.router.navigate(['/manager/inspections/executions', executionId]);
        },
        error: (error) => {
          console.error('Execution create error:', error);
          this.errorMsg.set(
            error?.error?.message ||
              "Erreur lors de la création de l'inspection."
          );
        },
      });
  }

  goBack(): void {
    this.router.navigate(['/manager/inspections']);
  }

  retry(): void {
    this.loadTemplates();
  }

  categoryLabel(category?: string): string {
    switch (category) {
      case 'safety':
        return 'Sécurité';
      case 'environment':
        return 'Environnement';
      case 'quality':
        return 'Qualité';
      case 'security':
        return 'Sûreté';
      case 'other':
        return 'Autre';
      default:
        return 'Autre';
    }
  }

  templateDescription(template: ChecklistTemplate): string {
    return template.description?.trim() || 'Aucune description';
  }

  templateTitle(template: ChecklistTemplate): string {
    return template.title || 'Template sans titre';
  }

  trackByTemplate(index: number, template: ChecklistTemplate): string {
    return template._id || String(index);
  }
}