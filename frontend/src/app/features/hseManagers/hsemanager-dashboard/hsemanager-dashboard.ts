import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

type StatCard = {
  label: string;
  value: number;
  unit?: string;
  icon: string;
  trend?: number;
  tone: 'primary' | 'success' | 'warn' | 'danger';
};

type ZoneRisk = {
  id: string;
  name: string;
  risk: 'low' | 'medium' | 'high';
  temperature: number;
  humidity: number;
  devicesOnline: number;
  devicesTotal: number;
};

type IncidentItem = {
  id: string;
  title: string;
  zone: string;
  severity: 'low' | 'medium' | 'high';
  date: string;
  status: 'open' | 'in_progress' | 'closed';
};

type ObservationItem = {
  id: string;
  title: string;
  zone: string;
  createdAt: string;
  status: 'open' | 'in_progress' | 'resolved' | 'rejected';
};

type TrainingItem = {
  id: string;
  title: string;
  audience: string;
  completion: number;
  dueDate: string;
};

type TeamActivity = {
  id: string;
  name: string;
  role: string;
  task: string;
  status: 'active' | 'idle' | 'offline';
};

type AlertItem = {
  id: string;
  message: string;
  zone: string;
  level: 'info' | 'warning' | 'critical';
  time: string;
};

@Component({
  selector: 'app-hsemanager-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './hsemanager-dashboard.html',
  styleUrl: './hsemanager-dashboard.scss',
})
export class HsemanagerDashboard {
  readonly today = new Date();

  readonly zones = signal<ZoneRisk[]>([
    {
      id: 'z1',
      name: 'Production A',
      risk: 'high',
      temperature: 31,
      humidity: 54,
      devicesOnline: 4,
      devicesTotal: 5,
    },
    {
      id: 'z2',
      name: 'Warehouse B',
      risk: 'medium',
      temperature: 26,
      humidity: 49,
      devicesOnline: 3,
      devicesTotal: 3,
    },
    {
      id: 'z3',
      name: 'Chemical Storage',
      risk: 'high',
      temperature: 29,
      humidity: 61,
      devicesOnline: 2,
      devicesTotal: 4,
    },
    {
      id: 'z4',
      name: 'Packaging Line',
      risk: 'low',
      temperature: 24,
      humidity: 46,
      devicesOnline: 2,
      devicesTotal: 2,
    },
  ]);

  readonly incidents = signal<IncidentItem[]>([
    {
      id: 'i1',
      title: 'Gas threshold exceeded',
      zone: 'Chemical Storage',
      severity: 'high',
      date: '2026-03-08T08:20:00',
      status: 'open',
    },
    {
      id: 'i2',
      title: 'Helmet not detected',
      zone: 'Production A',
      severity: 'medium',
      date: '2026-03-08T07:50:00',
      status: 'in_progress',
    },
    {
      id: 'i3',
      title: 'Humidity sensor offline',
      zone: 'Warehouse B',
      severity: 'low',
      date: '2026-03-07T17:30:00',
      status: 'closed',
    },
  ]);

  readonly observations = signal<ObservationItem[]>([
    {
      id: 'o1',
      title: 'Helmet not worn in production line',
      zone: 'Production A',
      createdAt: '2026-03-08T08:45:00',
      status: 'open',
    },
    {
      id: 'o2',
      title: 'Blocked emergency exit',
      zone: 'Warehouse B',
      createdAt: '2026-03-08T07:30:00',
      status: 'in_progress',
    },
    {
      id: 'o3',
      title: 'Chemical container without label',
      zone: 'Chemical Storage',
      createdAt: '2026-03-07T16:10:00',
      status: 'resolved',
    },
    {
      id: 'o4',
      title: 'Worker without reflective vest',
      zone: 'Packaging Line',
      createdAt: '2026-03-07T11:20:00',
      status: 'open',
    },
    {
      id: 'o5',
      title: 'Improper storage near evacuation path',
      zone: 'Warehouse B',
      createdAt: '2026-03-06T14:00:00',
      status: 'rejected',
    },
  ]);

  readonly trainings = signal<TrainingItem[]>([
    {
      id: 't1',
      title: 'Fire Safety Drill',
      audience: 'Production Team',
      completion: 84,
      dueDate: '2026-03-12',
    },
    {
      id: 't2',
      title: 'PPE Compliance Basics',
      audience: 'All Operators',
      completion: 67,
      dueDate: '2026-03-15',
    },
    {
      id: 't3',
      title: 'Chemical Risk Awareness',
      audience: 'Warehouse + Safety',
      completion: 52,
      dueDate: '2026-03-18',
    },
  ]);

  readonly team = signal<TeamActivity[]>([
    {
      id: 'u1',
      name: 'Sarra Trabelsi',
      role: 'HSE Agent',
      task: 'Zone inspection - Production A',
      status: 'active',
    },
    {
      id: 'u2',
      name: 'Ahmed Ben Ali',
      role: 'Safety Supervisor',
      task: 'Incident follow-up',
      status: 'active',
    },
    {
      id: 'u3',
      name: 'Mohamed Gharbi',
      role: 'Operator',
      task: 'Awaiting validation',
      status: 'idle',
    },
    {
      id: 'u4',
      name: 'Yasmine Krichen',
      role: 'Trainer',
      task: 'Offline',
      status: 'offline',
    },
  ]);

  readonly alerts = signal<AlertItem[]>([
    {
      id: 'a1',
      message: 'Gas sensor reported abnormal value',
      zone: 'Chemical Storage',
      level: 'critical',
      time: '2 min ago',
    },
    {
      id: 'a2',
      message: 'Device maintenance required',
      zone: 'Production A',
      level: 'warning',
      time: '18 min ago',
    },
    {
      id: 'a3',
      message: 'Training reminder sent to operators',
      zone: 'All Zones',
      level: 'info',
      time: '1 hour ago',
    },
  ]);

  readonly complianceRate = signal(91);
  readonly devicesOnline = signal(11);
  readonly devicesTotal = signal(14);
  readonly responseTime = signal(12);

  readonly onlineRate = computed(() => {
    const total = this.devicesTotal();
    return total ? Math.round((this.devicesOnline() / total) * 100) : 0;
  });

  readonly highRiskZones = computed(
    () => this.zones().filter(zone => zone.risk === 'high').length
  );

  readonly openIncidentsCount = computed(
    () => this.incidents().filter(incident => incident.status !== 'closed').length
  );

  readonly openObservationsCount = computed(
    () =>
      this.observations().filter(
        observation =>
          observation.status === 'open' || observation.status === 'in_progress'
      ).length
  );

  readonly trainingCompletionRate = computed(() => {
    const items = this.trainings();
    if (!items.length) return 0;

    const total = items.reduce((sum, item) => sum + item.completion, 0);
    return Math.round(total / items.length);
  });

  readonly stats = computed<StatCard[]>(() => [
    {
      label: 'Zones monitored',
      value: this.zones().length,
      icon: 'bi bi-geo-alt',
      trend: 8,
      tone: 'primary',
    },
    {
      label: 'Open observations',
      value: this.openObservationsCount(),
      icon: 'bi bi-search',
      trend: 6,
      tone: 'success',
    },
    {
      label: 'Open incidents',
      value: this.openIncidentsCount(),
      icon: 'bi bi-exclamation-triangle',
      trend: -2,
      tone: 'warn',
    },
    {
      label: 'Training completion',
      value: this.trainingCompletionRate(),
      unit: '%',
      icon: 'bi bi-mortarboard',
      trend: 11,
      tone: 'danger',
    },
  ]);

  readonly chartBars = computed(() => {
    const data = [
      { label: 'Mon', value: 5 },
      { label: 'Tue', value: 8 },
      { label: 'Wed', value: 4 },
      { label: 'Thu', value: 9 },
      { label: 'Fri', value: 6 },
      { label: 'Sat', value: 3 },
      { label: 'Sun', value: 7 },
    ];

    const max = Math.max(...data.map(item => item.value), 1);

    return data.map(item => ({
      ...item,
      height: `${(item.value / max) * 100}%`,
    }));
  });

  riskClass(risk: string): string {
    if (risk === 'low') return 'ok';
    if (risk === 'medium') return 'warn';
    return 'bad';
  }

  severityClass(level: string): string {
    if (level === 'low' || level === 'info') return 'ok';
    if (
      level === 'medium' ||
      level === 'warning' ||
      level === 'in_progress'
    ) {
      return 'warn';
    }
    return 'bad';
  }

  incidentStatusClass(status: string): string {
    if (status === 'closed') return 'ok';
    if (status === 'in_progress') return 'warn';
    return 'bad';
  }

  teamStatusClass(status: string): string {
    if (status === 'active') return 'ok';
    if (status === 'idle') return 'warn';
    return 'bad';
  }

  trackById = (_: number, item: { id: string }) => item.id;
}