import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

type MessagePriority = 'low' | 'medium' | 'high' | 'critical';
type MessageStatus = 'draft' | 'sent' | 'acknowledged' | 'archived';

interface MessageAttachment {
  id: string;
  name: string;
  type: 'image' | 'pdf' | 'doc' | 'other';
  size: string;
  url?: string;
}

interface MessageActivity {
  id: string;
  type: 'created' | 'sent' | 'read' | 'acknowledged' | 'updated';
  author: string;
  date: string;
  description: string;
}

interface OperationalMessageDetailModel {
  id: string;
  title: string;
  subject: string;
  content: string;
  priority: MessagePriority;
  status: MessageStatus;
  category: string;
  zone: string;
  device: string;
  author: {
    fullName: string;
    role: string;
    email: string;
  };
  recipients: string[];
  requiresAcknowledgement: boolean;
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
  attachments: MessageAttachment[];
  activity: MessageActivity[];
}

@Component({
  selector: 'app-operational-message-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './operational-message-detail.html',
  styleUrl: './operational-message-detail.scss',
})
export class OperationalMessageDetail {
  loading = signal(false);
  error = signal<string | null>(null);

  message = signal<OperationalMessageDetailModel>({
    id: 'OPM-2026-001',
    title: 'Alerte opérationnelle',
    subject: 'Vérification obligatoire des EPI avant accès à la zone Process',
    content:
      `Une vérification immédiate du port des équipements de protection individuelle est demandée avant l’accès à la zone Process.\n\n` +
      `Tous les agents et superviseurs doivent confirmer :\n` +
      `- le port du casque\n` +
      `- le port du gilet haute visibilité\n` +
      `- l’état général des équipements\n\n` +
      `En cas d’anomalie, merci de remonter l’information au responsable HSE via une observation ou un signalement direct.`,
    priority: 'high',
    status: 'sent',
    category: 'Consigne sécurité',
    zone: 'Process Zone',
    device: 'Caméra IA - PZ-04',
    author: {
      fullName: 'Adam Hlila',
      role: 'Manager HSE',
      email: 'adam.hlila@company.com',
    },
    recipients: [
      'Agents HSE',
      'Superviseurs',
      'Responsables de zone',
    ],
    requiresAcknowledgement: true,
    createdAt: '2026-03-27T17:40:00',
    updatedAt: '2026-03-27T18:05:00',
    sentAt: '2026-03-27T18:00:00',
    attachments: [
      {
        id: '1',
        name: 'consigne-epi-zone-process.pdf',
        type: 'pdf',
        size: '1.8 MB',
      },
      {
        id: '2',
        name: 'photo-zone-process.jpg',
        type: 'image',
        size: '920 KB',
      },
    ],
    activity: [
      {
        id: '1',
        type: 'created',
        author: 'Adam Hlila',
        date: '2026-03-27T17:40:00',
        description: 'Message opérationnel créé.',
      },
      {
        id: '2',
        type: 'updated',
        author: 'Adam Hlila',
        date: '2026-03-27T17:52:00',
        description: 'Contenu mis à jour avec consignes complémentaires.',
      },
      {
        id: '3',
        type: 'sent',
        author: 'Adam Hlila',
        date: '2026-03-27T18:00:00',
        description: 'Message envoyé aux destinataires ciblés.',
      },
      {
        id: '4',
        type: 'read',
        author: 'System',
        date: '2026-03-27T18:12:00',
        description: 'Premier accusé de lecture reçu.',
      },
    ],
  });

  priorityLabel = computed(() => {
    switch (this.message().priority) {
      case 'low':
        return 'Faible';
      case 'medium':
        return 'Moyenne';
      case 'high':
        return 'Élevée';
      case 'critical':
        return 'Critique';
      default:
        return '-';
    }
  });

  statusLabel = computed(() => {
    switch (this.message().status) {
      case 'draft':
        return 'Brouillon';
      case 'sent':
        return 'Envoyé';
      case 'acknowledged':
        return 'Confirmé';
      case 'archived':
        return 'Archivé';
      default:
        return '-';
    }
  });

  recipientsCount = computed(() => this.message().recipients.length);

  priorityClass(priority: MessagePriority): string {
    return `priority-${priority}`;
  }

  statusClass(status: MessageStatus): string {
    return `status-${status}`;
  }

  attachmentIcon(type: MessageAttachment['type']): string {
    switch (type) {
      case 'image':
        return 'bi bi-image';
      case 'pdf':
        return 'bi bi-file-earmark-pdf';
      case 'doc':
        return 'bi bi-file-earmark-text';
      default:
        return 'bi bi-paperclip';
    }
  }

  activityIcon(type: MessageActivity['type']): string {
    switch (type) {
      case 'created':
        return 'bi bi-plus-circle';
      case 'updated':
        return 'bi bi-pencil-square';
      case 'sent':
        return 'bi bi-send';
      case 'read':
        return 'bi bi-envelope-open';
      case 'acknowledged':
        return 'bi bi-check-circle';
      default:
        return 'bi bi-dot';
    }
  }

  markAsAcknowledged(): void {
    this.message.update((msg) => ({
      ...msg,
      status: 'acknowledged',
      activity: [
        {
          id: crypto.randomUUID(),
          type: 'acknowledged',
          author: 'Utilisateur courant',
          date: new Date().toISOString(),
          description: 'Le message a été marqué comme confirmé.',
        },
        ...msg.activity,
      ],
    }));
  }

  archiveMessage(): void {
    this.message.update((msg) => ({
      ...msg,
      status: 'archived',
      activity: [
        {
          id: crypto.randomUUID(),
          type: 'updated',
          author: 'Utilisateur courant',
          date: new Date().toISOString(),
          description: 'Le message a été archivé.',
        },
        ...msg.activity,
      ],
    }));
  }
}