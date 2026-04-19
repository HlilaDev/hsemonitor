import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  AuditStatus,
  AuditType,
} from '../../../../core/services/audits/audit-services';

type AuditItem = {
  _id: string;
  title: string;
  description: string;
  type: AuditType;
  status: AuditStatus;
  zoneName: string;
  auditorName: string;
  scheduledDate: string;
  completedDate?: string;
  score?: number;
  findingsCount: number;
  attachmentsCount: number;
};

@Component({
  selector: 'app-audit-overview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './audit-overview.html',
  styleUrl: './audit-overview.scss',
})
export class AuditOverview {
  q = signal('');
  selectedStatus = signal<'all' | AuditStatus>('all');
  selectedType = signal<'all' | AuditType>('all');

  audits = signal<AuditItem[]>([
    {
      _id: 'AUD-001',
      title: 'Weekly PPE Safety Audit - Zone A',
      description:
        'Inspection of PPE compliance, helmet usage, vest usage and access safety in production area.',
      type: 'safety',
      status: 'planned',
      zoneName: 'Production Zone A',
      auditorName: 'Ahmed Trabelsi',
      scheduledDate: '2026-03-10T09:00:00',
      score: 92,
      findingsCount: 2,
      attachmentsCount: 3,
    },
    {
      _id: 'AUD-002',
      title: 'Environmental Audit - Storage Area',
      description:
        'Check of waste handling, air quality logs, sensor consistency and hazardous material conditions.',
      type: 'environment',
      status: 'in_progress',
      zoneName: 'Storage Area',
      auditorName: 'Salma Ben Ali',
      scheduledDate: '2026-03-08T14:30:00',
      score: 76,
      findingsCount: 5,
      attachmentsCount: 1,
    },
    {
      _id: 'AUD-003',
      title: 'Internal Compliance Audit - Workshop B',
      description:
        'Verification of internal HSE procedures, documentation and incident prevention practices.',
      type: 'compliance',
      status: 'completed',
      zoneName: 'Workshop B',
      auditorName: 'Mohamed Gharbi',
      scheduledDate: '2026-03-05T08:00:00',
      completedDate: '2026-03-05T12:30:00',
      score: 88,
      findingsCount: 3,
      attachmentsCount: 4,
    },
    {
      _id: 'AUD-004',
      title: 'External Fire Readiness Audit',
      description:
        'Readiness review of fire response, emergency exits, extinguishers and worker evacuation flow.',
      type: 'external',
      status: 'cancelled',
      zoneName: 'Main Building',
      auditorName: 'External Inspector',
      scheduledDate: '2026-03-12T10:00:00',
      score: 0,
      findingsCount: 0,
      attachmentsCount: 0,
    },
    {
      _id: 'AUD-005',
      title: 'Quarterly Internal Safety Audit',
      description:
        'Quarterly overview of safety behavior, device condition and risk prevention in multiple areas.',
      type: 'internal',
      status: 'completed',
      zoneName: 'Assembly Unit',
      auditorName: 'Rim Jlassi',
      scheduledDate: '2026-03-01T09:15:00',
      completedDate: '2026-03-01T16:00:00',
      score: 95,
      findingsCount: 1,
      attachmentsCount: 2,
    },
  ]);

  filteredAudits = computed(() => {
    const query = this.q().trim().toLowerCase();
    const status = this.selectedStatus();
    const type = this.selectedType();

    return this.audits().filter((audit) => {
      const matchesQuery =
        !query ||
        audit.title.toLowerCase().includes(query) ||
        audit.description.toLowerCase().includes(query) ||
        audit.zoneName.toLowerCase().includes(query) ||
        audit.auditorName.toLowerCase().includes(query);

      const matchesStatus = status === 'all' || audit.status === status;
      const matchesType = type === 'all' || audit.type === type;

      return matchesQuery && matchesStatus && matchesType;
    });
  });

  totalAudits = computed(() => this.audits().length);

  completedAudits = computed(
    () => this.audits().filter((a) => a.status === 'completed').length
  );

  plannedAudits = computed(
    () => this.audits().filter((a) => a.status === 'planned').length
  );

  avgScore = computed(() => {
    const list = this.audits().filter((a) => typeof a.score === 'number' && a.score! > 0);
    if (!list.length) return 0;
    return Math.round(
      list.reduce((sum, item) => sum + (item.score || 0), 0) / list.length
    );
  });

  totalFindings = computed(() =>
    this.audits().reduce((sum, item) => sum + item.findingsCount, 0)
  );

  setStatus(status: 'all' | AuditStatus): void {
    this.selectedStatus.set(status);
  }

  setType(type: 'all' | AuditType): void {
    this.selectedType.set(type);
  }

  trackById(_: number, item: AuditItem): string {
    return item._id;
  }

  formatDate(value?: string): string {
    if (!value) return '-';
    return new Date(value).toLocaleString();
  }

  getScoreLabel(score?: number): string {
    if (score === undefined || score === null) return 'N/A';
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 50) return 'Average';
    return 'Critical';
  }
}