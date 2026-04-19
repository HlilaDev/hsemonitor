import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';

import {
  TrainingCategory,
  TrainingServices,
  TrainingStatus,
  UpdateTrainingDto,
} from '../../../../core/services/trainings/training-services';
import { EmployeeServices } from '../../../../core/services/employees/employee-services';

type ParticipantStatus = 'planned' | 'attended' | 'passed' | 'failed';

type EmployeeLite = {
  _id: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  badgeId?: string;
  employeeId?: string;
  department?: string;
  jobTitle?: string;
};

type TrainingParticipant = {
  _id?: string;
  employee?: EmployeeLite | string | null;
  status?: ParticipantStatus;
  score?: number;
  validUntil?: string | Date;
  note?: string;
};

type TrainingDetailModel = {
  _id: string;
  title: string;
  description?: string;
  category: TrainingCategory;
  provider?: string;
  location?: string;
  startDate: string | Date;
  endDate?: string | Date;
  status: TrainingStatus;
  participants?: TrainingParticipant[];
};

type EmployeesResponse =
  | EmployeeLite[]
  | {
      items?: EmployeeLite[];
      data?: EmployeeLite[];
    };

@Component({
  selector: 'app-training-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './training-edit.html',
  styleUrl: './training-edit.scss',
})
export class TrainingEdit implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private trainingsService = inject(TrainingServices);
  private employeesService = inject(EmployeeServices);

  isLoading = signal(true);
  isSaving = signal(false);
  error = signal<string | null>(null);
  trainingId = signal<string | null>(null);

  employees = signal<EmployeeLite[]>([]);
  selectedEmployeeIds = signal<string[]>([]);

  categories: TrainingCategory[] = [
    'safety',
    'environment',
    'quality',
    'security',
    'other',
  ];

  statuses: TrainingStatus[] = ['scheduled', 'completed', 'cancelled'];

  participantStatuses: ParticipantStatus[] = [
    'planned',
    'attended',
    'passed',
    'failed',
  ];

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    category: ['safety' as TrainingCategory, Validators.required],
    provider: [''],
    location: [''],
    startDate: ['', Validators.required],
    endDate: [''],
    status: ['scheduled' as TrainingStatus, Validators.required],
    participants: this.fb.array([]),
  });

  ngOnInit(): void {
    this.loadPage();
  }

  get participantsFA(): FormArray {
    return this.form.get('participants') as FormArray;
  }

  fieldInvalid(name: string): boolean {
    const control = this.form.get(name);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  loadPage(): void {
    this.isLoading.set(true);
    this.error.set(null);

    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error.set('Identifiant de formation introuvable.');
      this.isLoading.set(false);
      return;
    }

    this.trainingId.set(id);

    forkJoin({
      employeesResponse: this.employeesService.getAllEmployees(),
      training: this.trainingsService.getTrainingById(id),
    })
      .pipe(
        catchError((err) => {
          console.error('Load training edit page error:', err);
          this.error.set(
            err?.error?.message || 'Erreur lors du chargement de la formation.'
          );
          this.isLoading.set(false);
          return of(null);
        })
      )
      .subscribe(
        (result: {
          employeesResponse: EmployeesResponse;
          training: TrainingDetailModel;
        } | null) => {
          if (!result) return;

          const response = result.employeesResponse;

          const employees = Array.isArray(response)
            ? response
            : response.items || response.data || [];

          this.employees.set(employees);
          this.patchForm(result.training);
          this.isLoading.set(false);
        }
      );
  }

  patchForm(training: TrainingDetailModel): void {
    this.form.patchValue({
      title: training.title || '',
      description: training.description || '',
      category: training.category || 'safety',
      provider: training.provider || '',
      location: training.location || '',
      startDate: this.toInputDate(training.startDate),
      endDate: training.endDate ? this.toInputDate(training.endDate) : '',
      status: training.status || 'scheduled',
    });

    this.participantsFA.clear();

    const selectedIds: string[] = [];

    (training.participants || []).forEach((participant) => {
      const employeeId =
        typeof participant.employee === 'string'
          ? participant.employee
          : participant.employee?._id || '';

      if (!employeeId) return;

      selectedIds.push(employeeId);

      this.participantsFA.push(
        this.fb.group({
          employee: [employeeId, Validators.required],
          status: [participant.status || 'planned'],
          score: [participant.score ?? null],
          validUntil: [
            participant.validUntil ? this.toInputDate(participant.validUntil) : '',
          ],
          note: [participant.note || ''],
        })
      );
    });

    this.selectedEmployeeIds.set(selectedIds);
  }

  private toInputDate(value: string | Date | undefined): string {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().slice(0, 10);
  }

  employeeLabel(employee: EmployeeLite | null | undefined): string {
    if (!employee) return 'Employé';

    const fullName =
      employee.fullName ||
      `${employee.firstName ?? ''} ${employee.lastName ?? ''}`.trim() ||
      employee.name ||
      'Employé';

    const code = employee.badgeId || employee.employeeId;
    return code ? `${fullName} • ${code}` : fullName;
  }

  employeeLabelById(employeeId: string): string {
    const employee = this.employees().find((item) => item._id === employeeId);
    return this.employeeLabel(employee);
  }

  onEmployeesSelectChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const selectedIds = Array.from(select.selectedOptions).map(
      (option) => option.value
    );
    this.onEmployeesChange(selectedIds);
  }

  onEmployeesChange(ids: string[]): void {
    this.selectedEmployeeIds.set(ids);
    const nextIds = new Set(ids);

    for (let i = this.participantsFA.length - 1; i >= 0; i--) {
      const employeeId = this.participantsFA.at(i).get('employee')?.value;
      if (employeeId && !nextIds.has(employeeId)) {
        this.participantsFA.removeAt(i);
      }
    }

    const existingIds = new Set(
      this.participantsFA.controls.map((control) =>
        String(control.get('employee')?.value || '')
      )
    );

    ids.forEach((employeeId) => {
      if (!existingIds.has(employeeId)) {
        this.participantsFA.push(
          this.fb.group({
            employee: [employeeId, Validators.required],
            status: ['planned'],
            score: [null],
            validUntil: [''],
            note: [''],
          })
        );
      }
    });
  }

  removeParticipantById(employeeId: string): void {
    for (let i = this.participantsFA.length - 1; i >= 0; i--) {
      const currentId = this.participantsFA.at(i).get('employee')?.value;
      if (currentId === employeeId) {
        this.participantsFA.removeAt(i);
      }
    }

    this.selectedEmployeeIds.set(
      this.selectedEmployeeIds().filter((id) => id !== employeeId)
    );
  }

  statusLabel(status: ParticipantStatus): string {
    switch (status) {
      case 'planned':
        return 'Prévu';
      case 'attended':
        return 'Présent';
      case 'passed':
        return 'Réussi';
      case 'failed':
        return 'Échoué';
    }
  }

  save(): void {
    this.error.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Veuillez corriger les champs obligatoires.');
      return;
    }

    const id = this.trainingId();
    if (!id) {
      this.error.set('Identifiant de formation introuvable.');
      return;
    }

    const value = this.form.getRawValue();

    if (
      value.endDate &&
      value.startDate &&
      new Date(value.endDate) < new Date(value.startDate)
    ) {
      this.error.set('La date de fin doit être après la date de début.');
      return;
    }

    const dto: UpdateTrainingDto = {
      title: String(value.title || '').trim(),
      description: value.description?.trim() || undefined,
      category: value.category as TrainingCategory,
      provider: value.provider?.trim() || undefined,
      location: value.location?.trim() || undefined,
      startDate: value.startDate
        ? new Date(String(value.startDate)).toISOString()
        : undefined,
      endDate: value.endDate
        ? new Date(String(value.endDate)).toISOString()
        : undefined,
      status: value.status as TrainingStatus,
    };

    this.isSaving.set(true);

    this.trainingsService
      .editTraining(id, dto)
      .pipe(
        catchError((err) => {
          console.error('Update training error:', err);
          this.error.set(err?.error?.message || 'Modification échouée.');
          this.isSaving.set(false);
          return of(null);
        })
      )
      .subscribe((res) => {
        this.isSaving.set(false);
        if (!res) return;
        this.router.navigate(['/manager/trainings', id]);
      });
  }

  cancel(): void {
    const id = this.trainingId();
    if (!id) {
      this.router.navigate(['/manager/trainings']);
      return;
    }

    this.router.navigate(['/manager/trainings', id]);
  }
}