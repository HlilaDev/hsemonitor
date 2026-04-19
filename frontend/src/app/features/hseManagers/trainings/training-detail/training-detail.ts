import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { catchError, finalize, forkJoin, of, switchMap } from 'rxjs';

import { TrainingServices } from '../../../../core/services/trainings/training-services';
import {
  Employee,
  EmployeeServices,
} from '../../../../core/services/employees/employee-services';

type Category = 'safety' | 'environment' | 'quality' | 'security' | 'other';
type TrainingStatus = 'scheduled' | 'completed' | 'cancelled';
type ParticipantStatus = 'planned' | 'attended' | 'passed' | 'failed';

type TrainingParticipant = {
  _id?: string;
  employee?:
    | {
        _id: string;
        fullName?: string;
        firstName?: string;
        lastName?: string;
        employeeId?: string;
        department?: string;
        jobTitle?: string;
        isActive?: boolean;
      }
    | null;
  status?: ParticipantStatus;
  score?: number;
  validUntil?: string | Date;
  note?: string;
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
  _id: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
} | null;
  company?: {
    _id: string;
    name?: string;
  } | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

@Component({
  selector: 'app-training-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './training-detail.html',
  styleUrl: './training-detail.scss',
})
export class TrainingDetail {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private trainingsService = inject(TrainingServices);
  private employeeServices = inject(EmployeeServices);

  isLoading = signal(true);
  error = signal<string | null>(null);
  training = signal<TrainingDetailModel | null>(null);

  showAddParticipantsModal = signal(false);
  employeesLoading = signal(false);
  employeesError = signal<string | null>(null);
  isSubmittingParticipants = signal(false);

  allEmployees = signal<Employee[]>([]);
  employeeSearch = signal('');
  selectedEmployeeIds = signal<string[]>([]);

  ngOnInit(): void {
    this.loadTraining();
  }

  loadTraining(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id');

          if (!id) {
            this.error.set('Identifiant de formation introuvable.');
            this.isLoading.set(false);
            return of(null);
          }

          return this.trainingsService.getTrainingById(id).pipe(
            catchError((err) => {
              console.error('Get training detail error:', err);
              this.error.set(
                err?.error?.message || 'Erreur lors du chargement de la formation.'
              );
              this.isLoading.set(false);
              return of(null);
            })
          );
        })
      )
      .subscribe((response) => {
        this.training.set(response);
        this.isLoading.set(false);
      });
  }

  loadEmployees(): void {
    this.employeesLoading.set(true);
    this.employeesError.set(null);

    this.employeeServices
      .getAllEmployees({ isActive: true })
      .pipe(
        catchError((err) => {
          console.error('Get employees error:', err);
          this.employeesError.set(
            err?.message || 'Erreur lors du chargement des employés.'
          );
          return of([]);
        }),
        finalize(() => this.employeesLoading.set(false))
      )
      .subscribe((response: any) => {
        const items = Array.isArray(response)
          ? response
          : Array.isArray(response?.items)
          ? response.items
          : [];

        this.allEmployees.set(items);
      });
  }

  participantEmployeeIds = computed(() => {
    const participants = this.training()?.participants ?? [];
    return participants
      .map((participant) => participant.employee?._id)
      .filter((id): id is string => !!id);
  });

  availableEmployees = computed(() => {
    const alreadyAdded = new Set(this.participantEmployeeIds());
    const search = this.employeeSearch().trim().toLowerCase();

    return this.allEmployees().filter((employee) => {
      const id = employee._id;
      if (!id || alreadyAdded.has(id)) return false;
      if (employee.isActive === false) return false;

      if (!search) return true;

      const haystack = [
        employee.fullName,
        employee.employeeId,
        employee.department,
        employee.jobTitle,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(search);
    });
  });

  canManageParticipants = computed(() => {
    const t = this.training();
    if (!t) return false;
    if (t.status !== 'scheduled') return false;

    const start = new Date(t.startDate);
    if (Number.isNaN(start.getTime())) return false;

    const now = new Date();
    return start.getTime() > now.getTime();
  });

  selectedCount = computed(() => this.selectedEmployeeIds().length);

  goBack(): void {
    this.router.navigate(['/manager/trainings']);
  }

  goEdit(): void {
    const id = this.training()?._id;
    if (!id) return;
    this.router.navigate(['/manager/trainings', id, 'edit']);
  }

  openAddParticipantsModal(): void {
    if (!this.canManageParticipants()) return;

    this.employeeSearch.set('');
    this.selectedEmployeeIds.set([]);
    this.showAddParticipantsModal.set(true);

    if (this.allEmployees().length === 0) {
      this.loadEmployees();
    }
  }

  closeAddParticipantsModal(): void {
    if (this.isSubmittingParticipants()) return;

    this.showAddParticipantsModal.set(false);
    this.employeeSearch.set('');
    this.selectedEmployeeIds.set([]);
    this.employeesError.set(null);
  }

  onSearchEmployees(value: string): void {
    this.employeeSearch.set(value);
  }

  isSelected(employeeId?: string): boolean {
    if (!employeeId) return false;
    return this.selectedEmployeeIds().includes(employeeId);
  }

  toggleEmployee(employeeId?: string): void {
    if (!employeeId || this.isSubmittingParticipants()) return;

    const current = this.selectedEmployeeIds();

    if (current.includes(employeeId)) {
      this.selectedEmployeeIds.set(current.filter((id) => id !== employeeId));
      return;
    }

    this.selectedEmployeeIds.set([...current, employeeId]);
  }

  addSelectedParticipants(): void {
    const trainingId = this.training()?._id;
    const employeeIds = this.selectedEmployeeIds();

    if (!trainingId || !employeeIds.length || this.isSubmittingParticipants()) {
      return;
    }

    this.isSubmittingParticipants.set(true);
    this.employeesError.set(null);

    const requests = employeeIds.map((employeeId) =>
      this.trainingsService.addParticipant(trainingId, {
        employee: employeeId,
        status: 'planned',
      })
    );

    forkJoin(requests)
      .pipe(
        catchError((err) => {
          console.error('Add participants error:', err);
          this.employeesError.set(
            err?.error?.message || 'Erreur lors de l’ajout des participants.'
          );
          return of(null);
        }),
        finalize(() => this.isSubmittingParticipants.set(false))
      )
      .subscribe((result) => {
        if (!result) return;

        this.closeAddParticipantsModal();
        this.loadTraining();
      });
  }

  categoryLabel(category: Category | undefined): string {
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
        return '-';
    }
  }

  statusLabel(status: TrainingStatus | undefined): string {
    switch (status) {
      case 'scheduled':
        return 'Prévu';
      case 'completed':
        return 'Terminé';
      case 'cancelled':
        return 'Annulé';
      default:
        return '-';
    }
  }

  participantStatusLabel(status: ParticipantStatus | undefined): string {
    switch (status) {
      case 'planned':
        return 'Prévu';
      case 'attended':
        return 'Présent';
      case 'passed':
        return 'Réussi';
      case 'failed':
        return 'Échoué';
      default:
        return '-';
    }
  }

  badgeClass(status: TrainingStatus | undefined): string {
    return status === 'scheduled'
      ? 'badge scheduled'
      : status === 'completed'
      ? 'badge completed'
      : 'badge cancelled';
  }

  participantBadgeClass(status: ParticipantStatus | undefined): string {
    return status === 'planned'
      ? 'mini-badge planned'
      : status === 'attended'
      ? 'mini-badge attended'
      : status === 'passed'
      ? 'mini-badge passed'
      : 'mini-badge failed';
  }

  fmtDate(value: string | Date | undefined): string {
    if (!value) return '-';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';

    return date.toLocaleDateString();
  }

  fmtDateTime(value: string | Date | undefined): string {
    if (!value) return '-';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';

    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  }

  employeeName(participant: TrainingParticipant): string {
    const employee = participant.employee;
    if (!employee) return 'Employé supprimé';

    return (
      employee.fullName ||
      `${employee.firstName ?? ''} ${employee.lastName ?? ''}`.trim() ||
      employee.employeeId ||
      'Employé'
    );
  }

  employeeMeta(participant: TrainingParticipant): string {
    const employee = participant.employee;
    if (!employee) return '-';

    const parts = [
      employee.employeeId,
      employee.department,
      employee.jobTitle,
    ].filter(Boolean);

    return parts.length ? parts.join(' • ') : '-';
  }

  employeeShortMeta(employee: Employee): string {
    const parts = [
      employee.employeeId,
      employee.department,
      employee.jobTitle,
    ].filter(Boolean);

    return parts.length ? parts.join(' • ') : 'Aucune information';
  }

  initials(name?: string | null): string {
    if (!name) return 'EM';

    const words = name.trim().split(/\s+/).filter(Boolean);
    return words
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }

  trackByEmployee(_: number, employee: Employee): string {
    return employee._id || employee.fullName;
  }

  getCreatedByName(): string {
  const user = this.training()?.createdBy;

  if (!user) return '-';

  return (
    user.fullName ||
    [user.firstName, user.lastName].filter(v => !!v).join(' ').trim() ||
    '-'
  );
}
}