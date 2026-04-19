import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

type AuditStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';
type AuditType =
  | 'internal'
  | 'external'
  | 'safety'
  | 'environment'
  | 'compliance';

type FindingStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
type FindingSeverity = 'low' | 'medium' | 'high' | 'critical';

type FindingItem = {
  _id: string;
  title: string;
  description: string;
  severity: FindingSeverity;
  status: FindingStatus;
  dueDate?: string;
  assignedTo?: string;
};

type AttachmentItem = {
  name: string;
  url: string;
  type: 'pdf' | 'image' | 'doc' | 'other';
};

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
  createdAt: string;
  updatedAt: string;
  findings: FindingItem[];
  attachments: AttachmentItem[];
};

@Component({
  selector: 'app-audit-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './audit-details.html',
  styleUrl: './audit-details.scss',
})
export class AuditDetails {
  audit = signal<AuditItem>({
    _id: 'AUD-003',
    title: 'Internal Compliance Audit - Workshop B',
    description:
      'Detailed inspection of HSE compliance procedures, PPE adherence, emergency readiness, worker safety behavior, and documentation consistency inside Workshop B.',
    type: 'compliance',
    status: 'completed',
    zoneName: 'Workshop B',
    auditorName: 'Mohamed Gharbi',
    scheduledDate: '2026-03-05T08:00:00',
    completedDate: '2026-03-05T12:30:00',
    score: 88,
    createdAt: '2026-03-01T09:15:00',
    updatedAt: '2026-03-05T13:10:00',
    findings: [
      {
        _id: 'F-001',
        title: 'Emergency exit partially obstructed',
        description:
          'A pallet was stored too close to the marked emergency route near the west section.',
        severity: 'high',
        status: 'resolved',
        dueDate: '2026-03-07T16:00:00',
        assignedTo: 'Maintenance Team',
      },
      {
        _id: 'F-002',
        title: 'Missing reflective vest in restricted area',
        description:
          'One worker entered the restricted zone without reflective PPE during the inspection.',
        severity: 'medium',
        status: 'closed',
        dueDate: '2026-03-06T12:00:00',
        assignedTo: 'Shift Supervisor',
      },
      {
        _id: 'F-003',
        title: 'Sensor calibration log not updated',
        description:
          'Temperature monitoring device calibration sheet was not updated for the current month.',
        severity: 'low',
        status: 'open',
        dueDate: '2026-03-10T10:00:00',
        assignedTo: 'HSE Manager',
      },
    ],
    attachments: [
      {
        name: 'Audit Checklist Report.pdf',
        url: '#',
        type: 'pdf',
      },
      {
        name: 'Workshop Evidence Image.jpg',
        url: '#',
        type: 'image',
      },
      {
        name: 'Corrective Action Notes.docx',
        url: '#',
        type: 'doc',
      },
    ],
  });

  findingsCount = computed(() => this.audit().findings.length);

  resolvedCount = computed(
    () =>
      this.audit().findings.filter(
        (f) => f.status === 'resolved' || f.status === 'closed'
      ).length
  );

  openCount = computed(
    () =>
      this.audit().findings.filter(
        (f) => f.status === 'open' || f.status === 'in_progress'
      ).length
  );

  progressValue = computed(() => {
    const total = this.findingsCount();
    if (!total) return 0;
    return Math.round((this.resolvedCount() / total) * 100);
  });

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

  getSeverityIcon(severity: FindingSeverity): string {
    switch (severity) {
      case 'critical':
        return 'bi bi-exclamation-octagon';
      case 'high':
        return 'bi bi-exclamation-triangle';
      case 'medium':
        return 'bi bi-dash-circle';
      default:
        return 'bi bi-info-circle';
    }
  }

  getAttachmentIcon(type: AttachmentItem['type']): string {
    switch (type) {
      case 'pdf':
        return 'bi bi-file-earmark-pdf';
      case 'image':
        return 'bi bi-image';
      case 'doc':
        return 'bi bi-file-earmark-text';
      default:
        return 'bi bi-paperclip';
    }
  }
}