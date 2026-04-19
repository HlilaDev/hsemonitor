import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';

import {
  ChecklistExecution,
  ChecklistExecutionStatus,
  ChecklistServices,
} from '../../../../core/services/checklist/checklist-services';

@Component({
  selector: 'app-inspection-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  providers: [DatePipe],
  templateUrl: './inspection-list.html',
  styleUrl: './inspection-list.scss',
})
export class InspectionList {
  private readonly checklistService = inject(ChecklistServices);
  private readonly router = inject(Router);
  private readonly datePipe = inject(DatePipe);

  loading = signal(true);
  errorMsg = signal<string | null>(null);

  inspections = signal<ChecklistExecution[]>([]);
  searchTerm = signal('');
  selectedStatus = signal<'all' | ChecklistExecutionStatus>('all');

  readonly filteredInspections = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const status = this.selectedStatus();

    return this.inspections().filter((inspection) => {
      const matchesStatus =
        status === 'all' ? true : inspection.status === status;

      const title = this.templateTitle(inspection).toLowerCase();
      const agent = this.agentName(inspection).toLowerCase();
      const zone = this.zoneName(inspection).toLowerCase();

      const matchesSearch =
        !term ||
        title.includes(term) ||
        agent.includes(term) ||
        zone.includes(term);

      return matchesStatus && matchesSearch;
    });
  });

  readonly totalCount = computed(() => this.inspections().length);

  readonly draftCount = computed(
    () => this.inspections().filter((item) => item.status === 'draft').length
  );

  readonly inProgressCount = computed(
    () => this.inspections().filter((item) => item.status === 'in_progress').length
  );

  readonly completedCount = computed(
    () => this.inspections().filter((item) => item.status === 'completed').length
  );

  ngOnInit(): void {
    this.loadInspections();
  }

  loadInspections(): void {
    this.loading.set(true);
    this.errorMsg.set(null);

    this.checklistService
      .getAllExecutions()
      .pipe(
        catchError((error) => {
          console.error('Inspection list load error:', error);
          this.errorMsg.set('Erreur lors du chargement des inspections.');
          return of([]);
        }),
        finalize(() => {
          this.loading.set(false);
        })
      )
      .subscribe((data) => {
        this.inspections.set(Array.isArray(data) ? data : []);
      });
  }

  updateSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
  }

  updateStatus(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as
      | 'all'
      | ChecklistExecutionStatus;

    this.selectedStatus.set(value);
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedStatus.set('all');
  }

  goToCreate(): void {
    this.router.navigate(['/manager/inspections/create']);
  }

  openDetail(id?: string): void {
    if (!id) return;
    this.router.navigate(['/manager/inspections', id]);
  }

  templateTitle(execution: ChecklistExecution): string {
    if (!execution.checklist) return 'Inspection sans template';

    if (typeof execution.checklist === 'string') {
      return 'Inspection';
    }

    return execution.checklist.title || 'Inspection sans titre';
  }

  agentName(execution: ChecklistExecution): string {
    if (!execution.agent) return 'Non affecté';

    if (typeof execution.agent === 'string') {
      return 'Agent';
    }

    return (
      execution.agent.fullName ||
      `${execution.agent.firstName || ''} ${execution.agent.lastName || ''}`.trim() ||
      execution.agent.email ||
      'Agent'
    );
  }

  zoneName(execution: ChecklistExecution): string {
    if (!execution.zone) return '—';

    if (typeof execution.zone === 'string') {
      return 'Zone';
    }

    return execution.zone.name || '—';
  }

  statusLabel(status: ChecklistExecutionStatus): string {
    switch (status) {
      case 'draft':
        return 'Brouillon';
      case 'in_progress':
        return 'En cours';
      case 'completed':
        return 'Terminée';
      default:
        return status;
    }
  }

  statusClass(status: ChecklistExecutionStatus): string {
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

  scoreValue(execution: ChecklistExecution): number {
    return typeof execution.score === 'number' ? execution.score : 0;
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

  retry(): void {
    this.loadInspections();
  }

  trackByInspection(index: number, item: ChecklistExecution): string {
    return item._id || String(index);
  }
}