import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';

type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
type IncidentStatus = 'open' | 'investigating' | 'resolved';

interface IncidentItem {
  id: string;
  title: string;
  zone: string;
  category: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  reportedAt: string;
  assignedTo: string;
}

interface ZoneRisk {
  zone: string;
  incidents: number;
  risk: 'stable' | 'warning' | 'critical';
}

interface ActivityItem {
  time: string;
  text: string;
  type: 'create' | 'update' | 'resolve';
}

@Component({
  selector: 'app-incidents-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './incidents-overview.html',
  styleUrl: './incidents-overview.scss',
})
export class IncidentsOverview {
  selectedFilter = signal<'all' | IncidentStatus>('all');

  incidents = signal<IncidentItem[]>([
    {
      id: 'INC-2026-001',
      title: 'Helmet not worn in production line',
      zone: 'Production Zone A',
      category: 'PPE Violation',
      severity: 'high',
      status: 'open',
      reportedAt: '2026-03-08 08:12',
      assignedTo: 'HSE Agent 01',
    },
    {
      id: 'INC-2026-002',
      title: 'Gas level alert detected',
      zone: 'Chemical Storage',
      category: 'Sensor Alert',
      severity: 'critical',
      status: 'investigating',
      reportedAt: '2026-03-08 07:45',
      assignedTo: 'HSE Manager',
    },
    {
      id: 'INC-2026-003',
      title: 'Worker entered restricted area',
      zone: 'Restricted Access Gate',
      category: 'Unauthorized Access',
      severity: 'medium',
      status: 'resolved',
      reportedAt: '2026-03-08 06:55',
      assignedTo: 'Security Team',
    },
    {
      id: 'INC-2026-004',
      title: 'Smoke sensor abnormal reading',
      zone: 'Workshop B',
      category: 'Fire Risk',
      severity: 'high',
      status: 'investigating',
      reportedAt: '2026-03-08 05:40',
      assignedTo: 'Maintenance Team',
    },
    {
      id: 'INC-2026-005',
      title: 'Safety vest missing',
      zone: 'Loading Area',
      category: 'PPE Violation',
      severity: 'low',
      status: 'open',
      reportedAt: '2026-03-08 04:20',
      assignedTo: 'HSE Agent 02',
    },
  ]);

  riskZones = signal<ZoneRisk[]>([
    { zone: 'Chemical Storage', incidents: 9, risk: 'critical' },
    { zone: 'Production Zone A', incidents: 6, risk: 'warning' },
    { zone: 'Loading Area', incidents: 4, risk: 'warning' },
    { zone: 'Workshop B', incidents: 2, risk: 'stable' },
  ]);

  activities = signal<ActivityItem[]>([
    { time: '08:12', text: 'New PPE violation reported in Production Zone A', type: 'create' },
    { time: '07:50', text: 'Gas alert assigned to HSE Manager', type: 'update' },
    { time: '07:02', text: 'Restricted access incident resolved', type: 'resolve' },
    { time: '06:10', text: 'Workshop smoke alert updated by Maintenance Team', type: 'update' },
  ]);

  filteredIncidents = computed(() => {
    const filter = this.selectedFilter();
    if (filter === 'all') return this.incidents();
    return this.incidents().filter((i) => i.status === filter);
  });

  totalIncidents = computed(() => this.incidents().length);
  openCount = computed(() => this.incidents().filter((i) => i.status === 'open').length);
  investigatingCount = computed(() => this.incidents().filter((i) => i.status === 'investigating').length);
  resolvedCount = computed(() => this.incidents().filter((i) => i.status === 'resolved').length);
  criticalCount = computed(() => this.incidents().filter((i) => i.severity === 'critical').length);

  setFilter(filter: 'all' | IncidentStatus): void {
    this.selectedFilter.set(filter);
  }

  severityLabel(value: IncidentSeverity): string {
    switch (value) {
      case 'low':
        return 'Low';
      case 'medium':
        return 'Medium';
      case 'high':
        return 'High';
      case 'critical':
        return 'Critical';
      default:
        return value;
    }
  }

  statusLabel(value: IncidentStatus): string {
    switch (value) {
      case 'open':
        return 'Open';
      case 'investigating':
        return 'Investigating';
      case 'resolved':
        return 'Resolved';
      default:
        return value;
    }
  }

  riskLabel(value: ZoneRisk['risk']): string {
    switch (value) {
      case 'stable':
        return 'Stable';
      case 'warning':
        return 'Warning';
      case 'critical':
        return 'Critical';
      default:
        return value;
    }
  }
}