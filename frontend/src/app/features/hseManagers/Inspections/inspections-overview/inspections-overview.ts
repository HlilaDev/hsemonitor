import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { catchError, finalize, forkJoin, of } from 'rxjs';

import {
  ChecklistCategory,
  ChecklistExecution,
  ChecklistExecutionStatus,
  ChecklistServices,
  ChecklistTemplate,
} from '../../../../core/services/checklist/checklist-services';
import { InspectionKpiCard } from '../inspection-kpi-card/inspection-kpi-card';

@Component({
  selector: 'app-inspections-overview',
  standalone: true,
  imports: [CommonModule, RouterModule, InspectionKpiCard],
  templateUrl: './inspections-overview.html',
  styleUrl: './inspections-overview.scss',
})
export class InspectionsOverview {
  private readonly checklistService = inject(ChecklistServices);
  private readonly router = inject(Router);

  loading = signal(true);
  errorMsg = signal<string | null>(null);

  templates = signal<ChecklistTemplate[]>([]);
  executions = signal<ChecklistExecution[]>([]);

  readonly totalTemplates = computed(() => this.templates().length);

  readonly activeTemplates = computed(
    () => this.templates().filter((item) => item.isActive !== false).length
  );

  readonly inactiveTemplates = computed(() =>
    [...this.templates()]
      .filter((item) => item.isActive === false)
      .sort((a, b) => this.toTime(b.updatedAt || b.createdAt) - this.toTime(a.updatedAt || a.createdAt))
      .slice(0, 5)
  );

  readonly totalExecutions = computed(() => this.executions().length);

  readonly completedExecutions = computed(
    () => this.executions().filter((item) => item.status === 'completed').length
  );

  readonly inProgressExecutions = computed(
    () => this.executions().filter((item) => item.status === 'in_progress').length
  );

  readonly draftExecutions = computed(
    () => this.executions().filter((item) => item.status === 'draft').length
  );

  readonly completionRate = computed(() => {
    const total = this.totalExecutions();
    if (!total) return 0;
    return Math.round((this.completedExecutions() / total) * 100);
  });

  readonly recentExecutions = computed(() =>
    [...this.executions()]
      .sort((a, b) => this.toTime(b.createdAt) - this.toTime(a.createdAt))
      .slice(0, 5)
  );

  readonly recentTemplates = computed(() =>
    [...this.templates()]
      .sort((a, b) => this.toTime(b.createdAt) - this.toTime(a.createdAt))
      .slice(0, 4)
  );

  readonly lowScoreExecutions = computed(() =>
    [...this.executions()]
      .filter((item) => typeof item.score === 'number' && item.score < 60)
      .sort((a, b) => (a.score ?? 0) - (b.score ?? 0))
      .slice(0, 5)
  );

  readonly templatesByCategory = computed(() => {
    const base: Record<ChecklistCategory, number> = {
      safety: 0,
      environment: 0,
      quality: 0,
      security: 0,
      other: 0,
    };

    for (const template of this.templates()) {
      const category = template.category || 'other';
      base[category] = (base[category] || 0) + 1;
    }

    return [
      { key: 'safety', label: 'Safety', count: base.safety },
      { key: 'environment', label: 'Environment', count: base.environment },
      { key: 'quality', label: 'Quality', count: base.quality },
      { key: 'security', label: 'Security', count: base.security },
      { key: 'other', label: 'Other', count: base.other },
    ];
  });

  readonly topZones = computed(() => {
    const map = new Map<string, number>();

    for (const execution of this.executions()) {
      const zoneName = this.getZoneName(execution.zone);
      if (!zoneName || zoneName === '—') continue;
      map.set(zoneName, (map.get(zoneName) || 0) + 1);
    }

    return [...map.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  });

  readonly lastCreatedTemplate = computed(() => {
    const [item] = [...this.templates()].sort(
      (a, b) => this.toTime(b.createdAt) - this.toTime(a.createdAt)
    );
    return item ?? null;
  });

  readonly lastExecution = computed(() => {
    const [item] = [...this.executions()].sort(
      (a, b) => this.toTime(b.createdAt) - this.toTime(a.createdAt)
    );
    return item ?? null;
  });

  readonly lastCompletedExecution = computed(() => {
    const [item] = [...this.executions()]
      .filter((execution) => execution.status === 'completed')
      .sort((a, b) => this.toTime(b.updatedAt || b.createdAt) - this.toTime(a.updatedAt || a.createdAt));

    return item ?? null;
  });

  ngOnInit(): void {
    this.loadOverview();
  }

  loadOverview(): void {
    this.loading.set(true);
    this.errorMsg.set(null);

    forkJoin({
      templates: this.checklistService.getAllTemplates().pipe(
        catchError((error) => {
          console.error('Templates load error:', error);
          this.errorMsg.set(
            error?.error?.message ||
              'Erreur lors du chargement des templates inspections.'
          );
          return of([]);
        })
      ),
      executions: this.checklistService.getAllExecutions().pipe(
        catchError((error) => {
          console.error('Executions load error:', error);
          this.errorMsg.set(
            error?.error?.message ||
              'Erreur lors du chargement des exécutions inspections.'
          );
          return of([]);
        })
      ),
    })
      .pipe(
        finalize(() => {
          this.loading.set(false);
        })
      )
      .subscribe(({ templates, executions }) => {
        this.templates.set(Array.isArray(templates) ? templates : []);
        this.executions.set(Array.isArray(executions) ? executions : []);
      });
  }

  goToTemplates(): void {
    this.router.navigate(['/manager/inspections/templates']);
  }

  goToExecutions(): void {
    this.router.navigate(['/manager/inspections/list']);
  }

  goToCreateTemplate(): void {
    this.router.navigate(['/manager/inspections/templates/new']);
  }

  openTemplate(templateId?: string): void {
    if (!templateId) return;
    this.router.navigate(['/manager/inspections/templates', templateId]);
  }

  openExecution(executionId?: string): void {
    if (!executionId) return;
    this.router.navigate(['/manager/inspections/', executionId]);
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

  statusLabel(status?: ChecklistExecutionStatus): string {
    switch (status) {
      case 'draft':
        return 'Brouillon';
      case 'in_progress':
        return 'En cours';
      case 'completed':
        return 'Terminée';
      default:
        return '—';
    }
  }

  statusClass(status?: ChecklistExecutionStatus): string {
    if (status === 'completed') return 'badge completed';
    if (status === 'in_progress') return 'badge progress';
    return 'badge draft';
  }

  scoreClass(score?: number): string {
    if ((score ?? 0) < 60) return 'score low';
    if ((score ?? 0) < 80) return 'score medium';
    return 'score high';
  }

  getChecklistTitle(
    checklist:
      | string
      | {
          _id?: string;
          title?: string;
          description?: string;
          category?: ChecklistCategory;
        }
      | undefined
  ): string {
    if (!checklist) return 'Checklist';
    if (typeof checklist === 'string') return 'Checklist';
    return checklist.title || 'Checklist';
  }

  getAgentName(
    agent:
      | string
      | {
          _id?: string;
          firstName?: string;
          lastName?: string;
          fullName?: string;
          email?: string;
          role?: string;
        }
      | undefined
  ): string {
    if (!agent) return '—';
    if (typeof agent === 'string') return 'Agent';
    return (
      agent.fullName ||
      `${agent.firstName ?? ''} ${agent.lastName ?? ''}`.trim() ||
      agent.email ||
      'Agent'
    );
  }

  getZoneName(
    zone:
      | string
      | {
          _id?: string;
          name?: string;
        }
      | undefined
  ): string {
    if (!zone) return '—';
    if (typeof zone === 'string') return zone;
    return zone.name || '—';
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

  formatDateTime(value?: string): string {
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

  private toTime(value?: string): number {
    if (!value) return 0;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
  }
  goToCreateExecution(): void {
  this.router.navigate(['/manager/inspections/executions/new']);
}
}