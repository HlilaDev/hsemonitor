import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';

type Severity = 'low' | 'medium' | 'high' | 'critical';
type Status = 'open' | 'investigating' | 'resolved';
type TimelineType = 'report' | 'assign' | 'update' | 'action' | 'resolved';

interface TimelineItem {
  id: number;
  time: string;
  title: string;
  description: string;
  type: TimelineType;
}

interface EvidenceItem {
  id: number;
  name: string;
  type: 'image' | 'video' | 'sensor' | 'report';
  size: string;
}

@Component({
  selector: 'app-incident-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './incident-details.html',
  styleUrl: './incident-details.scss',
})
export class IncidentDetails {
  incident = signal({
    id: 'INC-2026-001',
    title: 'Helmet not worn in production line',
    description:
      'A worker was detected in Production Zone A without a safety helmet during active machine operation. The violation was flagged by the AI camera monitoring system and escalated to the HSE team for immediate intervention.',
    category: 'PPE Violation',
    severity: 'high' as Severity,
    status: 'investigating' as Status,
    zone: 'Production Zone A',
    exactLocation: 'Assembly Line 02',
    reportedAt: '08 Mar 2026 - 08:12',
    detectedBy: 'AI Camera A1',
    assignedTo: 'HSE Agent 01',
    supervisor: 'HSE Manager',
    workersInvolved: 1,
    relatedDevice: 'ESP32-CAM-A1',
    relatedSensor: 'Helmet Vision Model',
    lastUpdate: '08 Mar 2026 - 09:04',
    responseTime: '06 min',
  });

  timeline = signal<TimelineItem[]>([
    {
      id: 1,
      time: '08:12',
      title: 'Incident reported',
      description: 'AI monitoring system detected missing helmet on worker near machine area.',
      type: 'report',
    },
    {
      id: 2,
      time: '08:15',
      title: 'Incident assigned',
      description: 'Incident assigned to HSE Agent 01 for immediate verification.',
      type: 'assign',
    },
    {
      id: 3,
      time: '08:22',
      title: 'Field verification',
      description: 'Agent confirmed the PPE violation on site and recorded first observations.',
      type: 'update',
    },
    {
      id: 4,
      time: '08:37',
      title: 'Corrective action initiated',
      description: 'Worker removed from active area and instructed to wear required PPE before re-entry.',
      type: 'action',
    },
    {
      id: 5,
      time: '09:04',
      title: 'Manager review updated',
      description: 'Incident remains under investigation pending root cause and compliance review.',
      type: 'update',
    },
  ]);

  evidences = signal<EvidenceItem[]>([
    { id: 1, name: 'camera_capture_01.jpg', type: 'image', size: '1.8 MB' },
    { id: 2, name: 'camera_capture_02.jpg', type: 'image', size: '2.1 MB' },
    { id: 3, name: 'incident_report.pdf', type: 'report', size: '420 KB' },
    { id: 4, name: 'vision_detection_log.json', type: 'sensor', size: '96 KB' },
  ]);

  recommendations = signal<string[]>([
    'Reinforce PPE compliance check before entering Production Zone A.',
    'Add visual reminder signage near Assembly Line 02.',
    'Trigger real-time audible alert when helmet absence is detected.',
    'Review worker PPE awareness during next safety briefing.',
  ]);

  severityLabel = computed(() => {
    const severity = this.incident().severity;
    switch (severity) {
      case 'low':
        return 'Low';
      case 'medium':
        return 'Medium';
      case 'high':
        return 'High';
      case 'critical':
        return 'Critical';
      default:
        return severity;
    }
  });

  statusLabel = computed(() => {
    const status = this.incident().status;
    switch (status) {
      case 'open':
        return 'Open';
      case 'investigating':
        return 'Investigating';
      case 'resolved':
        return 'Resolved';
      default:
        return status;
    }
  });

  severityPercent = computed(() => {
    const severity = this.incident().severity;
    switch (severity) {
      case 'low':
        return 25;
      case 'medium':
        return 50;
      case 'high':
        return 75;
      case 'critical':
        return 100;
      default:
        return 0;
    }
  });

  timelineIcon(type: TimelineType): string {
    switch (type) {
      case 'report':
        return 'bi bi-exclamation-octagon';
      case 'assign':
        return 'bi bi-person-check';
      case 'update':
        return 'bi bi-pencil-square';
      case 'action':
        return 'bi bi-shield-check';
      case 'resolved':
        return 'bi bi-check2-circle';
      default:
        return 'bi bi-dot';
    }
  }

  evidenceIcon(type: EvidenceItem['type']): string {
    switch (type) {
      case 'image':
        return 'bi bi-image';
      case 'video':
        return 'bi bi-camera-video';
      case 'sensor':
        return 'bi bi-cpu';
      case 'report':
        return 'bi bi-file-earmark-text';
      default:
        return 'bi bi-file-earmark';
    }
  }
}