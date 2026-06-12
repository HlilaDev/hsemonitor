import { CommonModule, Location } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import {
  IncidentEvent,
  IncidentEventServices,
  IncidentSeverity,
  IncidentStatus,
} from '../../../../core/services/incidentEvents/incident-event-services';

@Component({
  selector: 'app-incident-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './incident-details.html',
  styleUrl: './incident-details.scss',
})
export class IncidentDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private incidentService = inject(IncidentEventServices);

  incident = signal<IncidentEvent | null>(null);

  isLoading = signal(false);
  isResolving = signal(false);
  isReviewing = signal(false);
  error = signal<string | null>(null);

  incidentId = computed(() => this.incident()?._id || '');

  ngOnInit(): void {
    this.loadIncident();
  }

  loadIncident(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error.set('Identifiant incident introuvable.');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    this.incidentService.getIncidentEventById(id).subscribe({
      next: (incident) => {
        this.incident.set(incident);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(
          err?.error?.message || 'Impossible de charger les détails de l’incident.'
        );
        this.isLoading.set(false);
      },
    });
  }

  goBack(): void {
    this.location.back();
  }

  reviewIncident(): void {
    const id = this.incidentId();

    if (!id) return;

    this.isReviewing.set(true);
    this.error.set(null);

    this.incidentService.reviewIncidentEvent(id).subscribe({
      next: (updated) => {
        this.incident.set(updated);
        this.isReviewing.set(false);
      },
      error: (err) => {
        this.error.set(
          err?.error?.message || 'Impossible de marquer l’incident comme révisé.'
        );
        this.isReviewing.set(false);
      },
    });
  }

  resolveIncident(): void {
    const id = this.incidentId();

    if (!id) return;

    this.isResolving.set(true);
    this.error.set(null);

    this.incidentService
      .resolveIncidentEvent(id, {
        status: 'closed',
        resolutionNote: 'Incident traité et clôturé.',
      })
      .subscribe({
        next: (updated) => {
          this.incident.set(updated);
          this.isResolving.set(false);
        },
        error: (err) => {
          this.error.set(
            err?.error?.message || 'Impossible de clôturer l’incident.'
          );
          this.isResolving.set(false);
        },
      });
  }

  markAsFalsePositive(): void {
    const id = this.incidentId();

    if (!id) return;

    this.isResolving.set(true);
    this.error.set(null);

    this.incidentService
      .resolveIncidentEvent(id, {
        status: 'false_positive',
        falsePositiveReason: 'Incident marqué comme faux positif après vérification.',
      })
      .subscribe({
        next: (updated) => {
          this.incident.set(updated);
          this.isResolving.set(false);
        },
        error: (err) => {
          this.error.set(
            err?.error?.message || 'Impossible de marquer comme faux positif.'
          );
          this.isResolving.set(false);
        },
      });
  }

  severityLabel(value?: IncidentSeverity): string {
    switch (value) {
      case 'low':
        return 'Faible';
      case 'medium':
        return 'Moyenne';
      case 'high':
        return 'Élevée';
      case 'critical':
        return 'Critique';
      default:
        return 'Non définie';
    }
  }

  statusLabel(value?: IncidentStatus): string {
    switch (value) {
      case 'open':
        return 'Ouvert';
      case 'reviewed':
        return 'Révisé';
      case 'in_progress':
        return 'En cours';
      case 'closed':
        return 'Clôturé';
      case 'false_positive':
        return 'Faux positif';
      default:
        return 'Inconnu';
    }
  }

  typeLabel(type?: string): string {
    switch (type) {
      case 'FALL':
        return 'Chute';
      case 'INJURY':
        return 'Blessure';
      case 'FIRE_ALERT':
        return 'Incendie observé';
      case 'LEAK':
        return 'Fuite signalée';
      case 'WORK_ACCIDENT':
        return 'Accident de travail';
      case 'NO_HELMET':
        return 'Absence de casque';
      case 'NO_VEST':
        return 'Absence de gilet';
      case 'GAS_ALERT':
        return 'Alerte gaz';
      case 'TEMP_ALERT':
        return 'Alerte température';
      case 'MANUAL_REPORT':
        return 'Signalement manuel';
      case 'OTHER':
        return 'Autre';
      default:
        return type || 'Non défini';
    }
  }

  sourceLabel(source?: string): string {
    switch (source) {
      case 'manual':
        return 'Manuel';
      case 'camera':
        return 'Caméra / IA';
      case 'sensor':
        return 'Capteur IoT';
      default:
        return 'Non définie';
    }
  }

  priorityLabel(priority?: string): string {
    switch (priority) {
      case 'low':
        return 'Faible';
      case 'normal':
        return 'Normale';
      case 'high':
        return 'Haute';
      case 'urgent':
        return 'Urgente';
      default:
        return 'Non définie';
    }
  }

  severityPercent(value?: IncidentSeverity): number {
    switch (value) {
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
  }

  getZoneName(zone: any): string {
    if (!zone) return 'Zone non définie';
    if (typeof zone === 'string') return zone;

    return zone.name || zone.label || 'Zone non définie';
  }

  getEmployeeName(employee: any): string {
    if (!employee) return 'Aucun employé';
    if (typeof employee === 'string') return employee;

    return (
      employee.fullName ||
      `${employee.firstName || ''} ${employee.lastName || ''}`.trim() ||
      employee.email ||
      'Aucun employé'
    );
  }

  getReportedBy(incident: IncidentEvent): string {
    const user = incident.reportedBy;

    if (!user) return 'Non défini';
    if (typeof user === 'string') return user;

    return (
      user.fullName ||
      `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
      user.email ||
      'Non défini'
    );
  }

  getReviewedBy(incident: IncidentEvent): string {
    const user = incident.reviewedBy;

    if (!user) return '—';
    if (typeof user === 'string') return user;

    return (
      user.fullName ||
      `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
      user.email ||
      '—'
    );
  }

  getResolvedBy(incident: IncidentEvent): string {
    const user = incident.resolvedBy;

    if (!user) return '—';
    if (typeof user === 'string') return user;

    return (
      user.fullName ||
      `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
      user.email ||
      '—'
    );
  }

  getDeviceName(device: any): string {
    if (!device) return '—';
    if (typeof device === 'string') return device;

    return device.name || device.deviceId || '—';
  }

  getReadingLabel(reading: any): string {
    if (!reading) return '—';
    if (typeof reading === 'string') return reading;

    return reading.sensorType || reading._id || '—';
  }

  formatDate(value?: string): string {
    if (!value) return '—';

    return new Date(value).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  evidenceIcon(type?: string): string {
    switch (type) {
      case 'image':
        return 'bi bi-image';
      case 'video':
        return 'bi bi-camera-video';
      default:
        return 'bi bi-paperclip';
    }
  }

  timelineIcon(type: 'report' | 'review' | 'resolve' | 'update'): string {
    switch (type) {
      case 'report':
        return 'bi bi-plus-circle';
      case 'review':
        return 'bi bi-eye';
      case 'resolve':
        return 'bi bi-check2-circle';
      case 'update':
        return 'bi bi-pencil-square';
      default:
        return 'bi bi-clock-history';
    }
  }

  timeline = computed(() => {
    const inc = this.incident();

    if (!inc) return [];

    const items: {
      id: string;
      type: 'report' | 'review' | 'resolve' | 'update';
      title: string;
      description: string;
      time: string;
    }[] = [
      {
        id: 'created',
        type: 'report',
        title: 'Incident déclaré',
        description: `Incident créé par ${this.getReportedBy(inc)}.`,
        time: this.formatDate(inc.createdAt),
      },
    ];

    if (inc.reviewedAt) {
      items.push({
        id: 'reviewed',
        type: 'review',
        title: 'Incident révisé',
        description: `Incident vérifié par ${this.getReviewedBy(inc)}.`,
        time: this.formatDate(inc.reviewedAt),
      });
    }

    if (inc.updatedAt && inc.updatedAt !== inc.createdAt) {
      items.push({
        id: 'updated',
        type: 'update',
        title: 'Incident mis à jour',
        description: 'Les informations de l’incident ont été modifiées.',
        time: this.formatDate(inc.updatedAt),
      });
    }

    if (inc.resolvedAt) {
      items.push({
        id: 'resolved',
        type: 'resolve',
        title:
          inc.status === 'false_positive'
            ? 'Incident marqué faux positif'
            : 'Incident clôturé',
        description:
          inc.resolutionNote ||
          inc.falsePositiveReason ||
          `Action réalisée par ${this.getResolvedBy(inc)}.`,
        time: this.formatDate(inc.resolvedAt),
      });
    }

    return items;
  });

  recommendations = computed(() => {
    const inc = this.incident();

    if (!inc) return [];

    const base = [
      'Documenter les circonstances exactes de l’incident.',
      'Informer le responsable HSE et suivre le plan d’action.',
    ];

    switch (inc.type) {
      case 'FALL':
        return [
          'Vérifier l’état du sol et les obstacles dans la zone.',
          'Installer une signalisation antidérapante si nécessaire.',
          ...base,
        ];
      case 'INJURY':
        return [
          'Assurer une prise en charge immédiate de l’employé.',
          'Analyser les causes de la blessure et les EPI utilisés.',
          ...base,
        ];
      case 'FIRE_ALERT':
        return [
          'Contrôler les équipements anti-incendie de la zone.',
          'Vérifier les sources potentielles d’ignition.',
          ...base,
        ];
      case 'LEAK':
        return [
          'Isoler rapidement la zone concernée.',
          'Identifier la source de la fuite et appliquer la procédure HSE.',
          ...base,
        ];
      case 'WORK_ACCIDENT':
        return [
          'Lancer une enquête interne sur l’accident de travail.',
          'Mettre à jour les consignes de sécurité si nécessaire.',
          ...base,
        ];
      default:
        return base;
    }
  });

  evidences = computed(() => {
    const inc = this.incident();

    if (!inc) return [];

    const list: {
      id: string;
      name: string;
      type: 'image' | 'video' | 'file';
      url?: string;
      size: string;
    }[] = [];

    if (inc.evidence?.imageUrl) {
      list.push({
        id: 'evidence-image',
        name: 'Image principale',
        type: 'image',
        url: inc.evidence.imageUrl,
        size: 'Image',
      });
    }

    if (inc.evidence?.videoUrl) {
      list.push({
        id: 'evidence-video',
        name: 'Vidéo de preuve',
        type: 'video',
        url: inc.evidence.videoUrl,
        size: 'Vidéo',
      });
    }

    for (const [index, image] of (inc.images || []).entries()) {
      list.push({
        id: `image-${index}`,
        name: `Image incident ${index + 1}`,
        type: 'image',
        url: image.url,
        size: 'Image',
      });
    }

    return list;
  });
}