import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';

import {
  ChecklistExecution,
  ChecklistItem,
  ChecklistResponse,
  ChecklistServices,
} from '../../../../core/services/checklist/checklist-services';

type DraftResponse = {
  itemId: string;
  value: boolean | string | number | null;
  comment: string;
  photo: string;
  saving: boolean;
  saved: boolean;
  error: string | null;
};

@Component({
  selector: 'app-inspection-fill',
  standalone: true,
  imports: [CommonModule, RouterModule],
  providers: [DatePipe],
  templateUrl: './inspection-fill.html',
  styleUrl: './inspection-fill.scss',
})
export class InspectionFill {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly checklistService = inject(ChecklistServices);
  private readonly datePipe = inject(DatePipe);

  loading = signal(true);
  pageError = signal<string | null>(null);
  completing = signal(false);

  inspection = signal<ChecklistExecution | null>(null);
  drafts = signal<Record<string, DraftResponse>>({});

  readonly checklistItems = computed<ChecklistItem[]>(() => {
    const execution = this.inspection();
    if (!execution?.checklist || typeof execution.checklist === 'string') {
      return [];
    }

    const items = execution.checklist.items;
    return Array.isArray(items) ? [...items].sort((a, b) => a.order - b.order) : [];
  });

  readonly answeredCount = computed(() => {
    return this.checklistItems().filter((item) => {
      const draft = this.getDraft(item._id);
      return !this.isEmptyValue(draft.value);
    }).length;
  });

  readonly totalCount = computed(() => this.checklistItems().length);

  readonly progressPercent = computed(() => {
    const total = this.totalCount();
    if (!total) return 0;
    return Math.round((this.answeredCount() / total) * 100);
  });

  readonly canComplete = computed(() => {
    const execution = this.inspection();
    return !!execution && execution.status !== 'completed' && !this.completing();
  });

  ngOnInit(): void {
    this.loadInspection();
  }

  loadInspection(): void {
    this.loading.set(true);
    this.pageError.set(null);
    this.inspection.set(null);
    this.drafts.set({});

    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id');

          if (!id) {
            this.pageError.set("Identifiant d'inspection introuvable.");
            return of(null);
          }

          return this.checklistService.getExecutionById(id).pipe(
            catchError((error) => {
              console.error('Inspection fill load error:', error);
              this.pageError.set(
                "Erreur lors du chargement de l'inspection."
              );
              return of(null);
            })
          );
        })
      )
      .subscribe((data) => {
        this.inspection.set(data);
        this.initializeDrafts(data);
        this.loading.set(false);
      });
  }

  initializeDrafts(execution: ChecklistExecution | null): void {
    const nextDrafts: Record<string, DraftResponse> = {};

    const items =
      execution?.checklist && typeof execution.checklist !== 'string'
        ? execution.checklist.items || []
        : [];

    const responses = execution?.responses || [];

    for (const item of items) {
      const response = responses.find((r) => this.responseItemId(r) === item._id);

      nextDrafts[item._id] = {
        itemId: item._id,
        value: response?.value ?? null,
        comment: response?.comment || '',
        photo: response?.photo || '',
        saving: false,
        saved: false,
        error: null,
      };
    }

    this.drafts.set(nextDrafts);
  }

  responseItemId(response: ChecklistResponse): string {
    if (!response.item) return '';
    if (typeof response.item === 'string') return response.item;
    return response.item._id || '';
  }

  getDraft(itemId: string): DraftResponse {
    return (
      this.drafts()[itemId] || {
        itemId,
        value: null,
        comment: '',
        photo: '',
        saving: false,
        saved: false,
        error: null,
      }
    );
  }

  setBooleanValue(itemId: string, value: boolean): void {
    this.patchDraft(itemId, {
      value,
      saved: false,
      error: null,
    });
  }

  updateTextValue(itemId: string, event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.patchDraft(itemId, {
      value,
      saved: false,
      error: null,
    });
  }

  updateNumberValue(itemId: string, event: Event): void {
    const raw = (event.target as HTMLInputElement).value;

    this.patchDraft(itemId, {
      value: raw === '' ? null : Number(raw),
      saved: false,
      error: null,
    });
  }

  updateComment(itemId: string, event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.patchDraft(itemId, {
      comment: value,
      saved: false,
      error: null,
    });
  }

  updatePhoto(itemId: string, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.patchDraft(itemId, {
      photo: value,
      saved: false,
      error: null,
    });
  }

  patchDraft(itemId: string, patch: Partial<DraftResponse>): void {
    this.drafts.update((current) => ({
      ...current,
      [itemId]: {
        ...this.getDraft(itemId),
        ...patch,
      },
    }));
  }

  saveItemResponse(item: ChecklistItem): void {
    const execution = this.inspection();
    if (!execution?._id) return;

    const draft = this.getDraft(item._id);

    if (item.isRequired && this.isEmptyValue(draft.value)) {
      this.patchDraft(item._id, {
        error: 'Cette réponse est obligatoire.',
      });
      return;
    }

    this.patchDraft(item._id, {
      saving: true,
      saved: false,
      error: null,
    });

    this.checklistService
      .saveResponse(execution._id, {
        itemId: item._id,
        value: draft.value,
        comment: draft.comment.trim() || undefined,
        photo: draft.photo.trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.patchDraft(item._id, {
            saving: false,
            saved: true,
            error: null,
          });
        },
        error: (error) => {
          console.error('Save response error:', error);
          this.patchDraft(item._id, {
            saving: false,
            saved: false,
            error:
              error?.error?.message ||
              'Erreur lors de la sauvegarde de la réponse.',
          });
        },
      });
  }

  completeInspection(): void {
    const execution = this.inspection();
    if (!execution?._id || this.completing()) return;

    this.completing.set(true);
    this.pageError.set(null);

    this.checklistService
      .completeExecution(execution._id, {
        notes: execution.notes || '',
      })
      .subscribe({
        next: (response) => {
          this.inspection.set(response.execution);
          this.completing.set(false);
          this.router.navigate(['/manager/inspections', execution._id]);
        },
        error: (error) => {
          console.error('Complete inspection error:', error);
          this.pageError.set(
            error?.error?.message ||
              "Erreur lors de la finalisation de l'inspection."
          );
          this.completing.set(false);
        },
      });
  }

  goBack(): void {
    const id = this.inspection()?._id;
    if (id) {
      this.router.navigate(['/manager/inspections', id]);
      return;
    }

    this.router.navigate(['/manager/inspections']);
  }

  retry(): void {
    this.loadInspection();
  }

  itemTypeLabel(type?: string): string {
    switch (type) {
      case 'boolean':
        return 'Oui / Non';
      case 'text':
        return 'Texte';
      case 'number':
        return 'Nombre';
      default:
        return 'Réponse';
    }
  }

  executionTitle(): string {
    const execution = this.inspection();
    if (!execution?.checklist || typeof execution.checklist === 'string') {
      return 'Inspection';
    }

    return execution.checklist.title || 'Inspection';
  }

  executionDescription(): string {
    const execution = this.inspection();
    if (!execution?.checklist || typeof execution.checklist === 'string') {
      return 'Remplissez la checklist de cette inspection.';
    }

    return (
      execution.checklist.description ||
      'Remplissez la checklist de cette inspection.'
    );
  }

  statusLabel(status?: string): string {
    switch (status) {
      case 'draft':
        return 'Brouillon';
      case 'in_progress':
        return 'En cours';
      case 'completed':
        return 'Terminée';
      default:
        return 'Inconnu';
    }
  }

  statusClass(status?: string): string {
    switch (status) {
      case 'draft':
        return 'status-draft';
      case 'in_progress':
        return 'status-progress';
      case 'completed':
        return 'status-completed';
      default:
        return 'status-default';
    }
  }

  displayDate(value?: string): string {
    if (!value) return '—';
    return this.datePipe.transform(value, 'dd MMM yyyy, HH:mm') || '—';
  }

  isEmptyValue(value: boolean | string | number | null): boolean {
    return value === null || value === undefined || value === '';
  }

  isBooleanTrue(itemId: string): boolean {
    return this.getDraft(itemId).value === true;
  }

  isBooleanFalse(itemId: string): boolean {
    return this.getDraft(itemId).value === false;
  }

  trackByItem(index: number, item: ChecklistItem): string {
    return item._id || String(index);
  }
}