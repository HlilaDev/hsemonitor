import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';

import {
  ChecklistExecution,
  ChecklistExecutionStatus,
  ChecklistResponse,
  ChecklistServices,
} from '../../../../core/services/checklist/checklist-services';

@Component({
  selector: 'app-inspection-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  providers: [DatePipe],
  templateUrl: './inspection-details.html',
  styleUrl: './inspection-details.scss',
})
export class InspectionDetails {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly checklistService = inject(ChecklistServices);
  private readonly datePipe = inject(DatePipe);

  loading = signal(true);
  actionLoading = signal(false);
  errorMsg = signal<string | null>(null);
  inspection = signal<ChecklistExecution | null>(null);

  readonly responses = computed(() => this.inspection()?.responses ?? []);

  readonly responseCount = computed(() => this.responses().length);

  readonly completionRate = computed(() => {
    const total = this.responseCount();
    if (!total) return 0;

    const answered = this.responses().filter((response) =>
      this.hasResponseValue(response)
    ).length;

    return Math.round((answered / total) * 100);
  });

  readonly canComplete = computed(() => {
    const current = this.inspection();
    if (!current) return false;
    return current.status !== 'completed' && !this.actionLoading();
  });

  ngOnInit(): void {
    this.loadInspection();
  }

  loadInspection(): void {
    this.loading.set(true);
    this.errorMsg.set(null);
    this.inspection.set(null);

    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id');

          if (!id) {
            this.errorMsg.set("Identifiant d'inspection introuvable.");
            return of(null);
          }

          return this.checklistService.getExecutionById(id).pipe(
            catchError((error) => {
              console.error('Inspection detail load error:', error);
              this.errorMsg.set(
                "Erreur lors du chargement du détail de l'inspection."
              );
              return of(null);
            })
          );
        })
      )
      .subscribe((data) => {
        this.inspection.set(data);
        this.loading.set(false);
      });
  }

  goBack(): void {
    this.router.navigate(['/manager/inspections']);
  }

  retry(): void {
    this.loadInspection();
  }

  completeInspection(): void {
    const current = this.inspection();
    if (!current?._id || this.actionLoading()) return;

    this.actionLoading.set(true);
    this.errorMsg.set(null);

    this.checklistService.completeExecution(current._id, {
      notes: current.notes || '',
    }).subscribe({
      next: (response) => {
        this.inspection.set(response.execution);
        this.actionLoading.set(false);
      },
      error: (error) => {
        console.error('Complete inspection error:', error);
        this.errorMsg.set(
          error?.error?.message ||
            "Erreur lors de la finalisation de l'inspection."
        );
        this.actionLoading.set(false);
      },
    });
  }

  openPhoto(photo?: string): void {
    if (!photo) return;
    window.open(photo, '_blank');
  }

  checklistTitle(execution: ChecklistExecution | null): string {
    if (!execution?.checklist) return 'Inspection sans template';

    if (typeof execution.checklist === 'string') {
      return 'Inspection';
    }

    return execution.checklist.title || 'Inspection sans titre';
  }

  checklistDescription(execution: ChecklistExecution | null): string {
    if (!execution?.checklist || typeof execution.checklist === 'string') {
      return 'Aucune description';
    }

    return execution.checklist.description || 'Aucune description';
  }

  checklistCategory(execution: ChecklistExecution | null): string {
    if (!execution?.checklist || typeof execution.checklist === 'string') {
      return 'other';
    }

    return execution.checklist.category || 'other';
  }

  agentName(execution: ChecklistExecution | null): string {
    if (!execution?.agent) return 'Non affecté';

    if (typeof execution.agent === 'string') return 'Agent';

    return (
      execution.agent.fullName ||
      `${execution.agent.firstName || ''} ${execution.agent.lastName || ''}`.trim() ||
      execution.agent.email ||
      'Agent'
    );
  }

  zoneName(execution: ChecklistExecution | null): string {
    if (!execution?.zone) return '—';

    if (typeof execution.zone === 'string') return 'Zone';

    return execution.zone.name || '—';
  }

  statusLabel(status?: ChecklistExecutionStatus): string {
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

  statusClass(status?: ChecklistExecutionStatus): string {
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

  scoreValue(execution: ChecklistExecution | null): number {
    if (!execution || typeof execution.score !== 'number') return 0;
    return execution.score;
  }

  scoreClass(score: number): string {
    if (score < 40) return 'score-low';
    if (score < 75) return 'score-medium';
    return 'score-good';
  }

  displayDate(value?: string): string {
    if (!value) return '—';
    return this.datePipe.transform(value, 'dd MMM yyyy, HH:mm') || '—';
  }

  responseLabel(response: ChecklistResponse): string {
    if (!response.item) return 'Question';

    if (typeof response.item === 'string') return 'Question';

    return response.item.label || 'Question';
  }

  responseType(response: ChecklistResponse): string {
    if (!response.item || typeof response.item === 'string') return 'text';
    return response.item.type || 'text';
  }

  responseValue(response: ChecklistResponse): string {
    const value = response.value;

    if (value === null || value === undefined || value === '') {
      return 'Aucune réponse';
    }

    if (typeof value === 'boolean') {
      return value ? 'Oui' : 'Non';
    }

    return String(value);
  }

  hasResponseValue(response: ChecklistResponse): boolean {
    return !(
      response.value === null ||
      response.value === undefined ||
      response.value === ''
    );
  }

  hasComment(response: ChecklistResponse): boolean {
    return !!response.comment?.trim();
  }

  hasPhoto(response: ChecklistResponse): boolean {
    return !!response.photo?.trim();
  }

  trackByResponse(index: number, response: ChecklistResponse): string {
    return response._id || String(index);
  }
}