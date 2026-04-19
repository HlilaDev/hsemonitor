import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { catchError, finalize, of, switchMap } from 'rxjs';

import {
  ParticipantStatus,
  TrainingServices,
  TrainingStatus,
} from '../../../../core/services/trainings/training-services';

type Category = 'safety' | 'environment' | 'quality' | 'security' | 'other';

type TrainingParticipant = {
  _id?: string;
  employee?:
    | {
        _id?: string;
        fullName?: string;
        firstName?: string;
        lastName?: string;
        employeeId?: string;
        department?: string;
        jobTitle?: string;
      }
    | string
    | null;
  status?: ParticipantStatus;
  score?: number;
  validUntil?: string | Date;
  note?: string;

  saving?: boolean;
};

type TrainingDetailModel = {
  _id: string;
  title: string;
  description?: string;
  category: Category;
  provider?: string;
  location?: string;
  startDate: string | Date;
  endDate?: string | Date;
  status: TrainingStatus;
  participants?: TrainingParticipant[];
  createdBy?: {
    _id?: string;
    firstName?: string;
        lastName?: string;
    email?: string;
    role?: string;
  } | null;
  company?: {
    _id?: string;
    name?: string;
  } | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

@Component({
  selector: 'app-training-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './training-details.html',
  styleUrl: './training-details.scss',
})
export class TrainingDetails {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private trainingsService = inject(TrainingServices);

  loading = true;
  errorMsg = '';
  successMsg = '';

  training: TrainingDetailModel | null = null;

  selectedStatus: TrainingStatus = 'scheduled';
  savingStatus = false;

  readonly statusOptions: Array<{ value: TrainingStatus; label: string }> = [
    { value: 'scheduled', label: 'Planifiée' },
    { value: 'completed', label: 'Terminée' },
    { value: 'cancelled', label: 'Annulée' },
  ];

  readonly participantStatusOptions: Array<{
    value: ParticipantStatus;
    label: string;
  }> = [
    { value: 'planned', label: 'Prévu' },
    { value: 'attended', label: 'Présent' },
    { value: 'passed', label: 'Réussi' },
    { value: 'failed', label: 'Absent / échoué' },
  ];

  ngOnInit(): void {
    this.loadTraining();
  }

  loadTraining(): void {
    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id');

          if (!id) {
            this.errorMsg = 'Identifiant de formation introuvable.';
            this.loading = false;
            return of(null);
          }

          return this.trainingsService.getTrainingById(id).pipe(
            catchError((err) => {
              console.error('Training detail error:', err);
              this.errorMsg =
                err?.error?.message ||
                'Erreur lors du chargement de la formation.';
              this.loading = false;
              return of(null);
            })
          );
        })
      )
      .subscribe((response) => {
        this.training = response;
        this.selectedStatus = response?.status ?? 'scheduled';
        this.loading = false;
      });
  }

  goBack(): void {
    this.router.navigate(['/agent/trainings']);
  }

  refresh(): void {
    this.loadTraining();
  }

  updateTrainingStatus(): void {
    if (!this.training?._id) return;

    this.savingStatus = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.trainingsService
      .editTraining(this.training._id, {
        status: this.selectedStatus,
      })
      .pipe(
        catchError((err) => {
          console.error('Update training status error:', err);
          this.errorMsg =
            err?.error?.message ||
            'Impossible de mettre à jour le statut de la formation.';
          return of(null);
        }),
        finalize(() => {
          this.savingStatus = false;
        })
      )
      .subscribe((updated) => {
        if (!updated) return;

        this.training = {
          ...(this.training as TrainingDetailModel),
          ...updated,
          status: updated?.status ?? this.selectedStatus,
        };

        this.selectedStatus = updated?.status ?? this.selectedStatus;
        this.successMsg = 'Statut de la formation mis à jour avec succès.';
      });
  }

  saveParticipant(participant: TrainingParticipant): void {
    if (!this.training?._id || !participant?._id) return;

    participant.saving = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.trainingsService
      .updateParticipant(this.training._id, participant._id, {
        status: participant.status,
        score:
          participant.score === null ||
          participant.score === undefined ||
          participant.score === ('' as any)
            ? undefined
            : Number(participant.score),
        validUntil: this.toDateInputValue(participant.validUntil) || undefined,
        note: participant.note?.trim() || undefined,
      })
      .pipe(
        catchError((err) => {
          console.error('Update participant error:', err);
          this.errorMsg =
            err?.error?.message ||
            'Impossible de mettre à jour ce participant.';
          return of(null);
        }),
        finalize(() => {
          participant.saving = false;
        })
      )
      .subscribe((updatedParticipant) => {
        if (!updatedParticipant || !this.training?.participants) return;

        this.training.participants = this.training.participants.map((item) =>
          item._id === participant._id
            ? {
                ...item,
                ...updatedParticipant,
                saving: false,
              }
            : item
        );

        this.successMsg = 'Participant mis à jour avec succès.';
      });
  }

  markAllPlanned(): void {
    if (!this.training?.participants?.length) return;

    this.training.participants = this.training.participants.map((participant) => ({
      ...participant,
      status: 'planned',
    }));
  }

  presentCount(): number {
    return (
      this.training?.participants?.filter(
        (participant) =>
          participant.status === 'attended' || participant.status === 'passed'
      ).length ?? 0
    );
  }

  absentCount(): number {
    return (
      this.training?.participants?.filter(
        (participant) => participant.status === 'failed'
      ).length ?? 0
    );
  }

  plannedCount(): number {
    return (
      this.training?.participants?.filter(
        (participant) => participant.status === 'planned'
      ).length ?? 0
    );
  }

  categoryLabel(category?: Category): string {
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

  statusLabel(status?: TrainingStatus): string {
    switch (status) {
      case 'scheduled':
        return 'Planifiée';
      case 'completed':
        return 'Terminée';
      case 'cancelled':
        return 'Annulée';
      default:
        return '—';
    }
  }

  participantStatusLabel(status?: ParticipantStatus): string {
    switch (status) {
      case 'planned':
        return 'Prévu';
      case 'attended':
        return 'Présent';
      case 'passed':
        return 'Réussi';
      case 'failed':
        return 'Absent / échoué';
      default:
        return '—';
    }
  }

  badgeClass(status?: TrainingStatus): string {
    return status === 'scheduled'
      ? 'badge scheduled'
      : status === 'completed'
      ? 'badge completed'
      : 'badge cancelled';
  }

  participantBadgeClass(status?: ParticipantStatus): string {
    return status === 'planned'
      ? 'mini-badge planned'
      : status === 'attended'
      ? 'mini-badge attended'
      : status === 'passed'
      ? 'mini-badge passed'
      : 'mini-badge failed';
  }

  employeeName(participant: TrainingParticipant): string {
    const employee = participant.employee;

    if (!employee) return 'Employé supprimé';
    if (typeof employee === 'string') return employee;

    return (
      employee.fullName ||
      `${employee.firstName ?? ''} ${employee.lastName ?? ''}`.trim() ||
      employee.employeeId ||
      'Employé'
    );
  }

  employeeMeta(participant: TrainingParticipant): string {
    const employee = participant.employee;

    if (!employee || typeof employee === 'string') return '—';

    const parts = [
      employee.employeeId,
      employee.department,
      employee.jobTitle,
    ].filter(Boolean);

    return parts.length ? parts.join(' • ') : '—';
  }

  formatDate(value?: string | Date): string {
    if (!value) return '—';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';

    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  formatDateTime(value?: string | Date): string {
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

  toDateInputValue(value?: string | Date): string {
    if (!value) return '';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}