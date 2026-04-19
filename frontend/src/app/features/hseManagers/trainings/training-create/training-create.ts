import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';

import {
  CreateTrainingDto,
  TrainingCategory,
  TrainingServices,
  TrainingStatus,
} from '../../../../core/services/trainings/training-services';
import { EmployeeServices } from '../../../../core/services/employees/employee-services';

type EmployeeLite = {
  _id: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  badgeId?: string;
  department?: string;
  jobTitle?: string;
};

@Component({
  selector: 'app-training-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './training-create.html',
  styleUrl: './training-create.scss',
})
export class TrainingCreate implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private trainingsService = inject(TrainingServices);
  private employeesService = inject(EmployeeServices);

  isLoading = signal(false);
  error = signal<string | null>(null);

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

  readonly selectedParticipants = computed(() =>
    this.participantsFA.controls.map((control) => {
      const employeeId = String(control.get('employee')?.value || '');
      const employee = this.employees().find((e) => e._id === employeeId);

      return {
        employeeId,
        label: this.employeeLabel(employee),
        status: String(control.get('status')?.value || 'planned'),
      };
    })
  );

  ngOnInit(): void {
    this.loadEmployees();
  }

  get participantsFA(): FormArray {
    return this.form.get('participants') as FormArray;
  }

  fieldInvalid(name: string): boolean {
    const control = this.form.get(name);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  private loadEmployees(): void {
    this.employeesService
      .getAllEmployees()
      .pipe(
        catchError((err) => {
          console.error('Load employees error:', err);
          this.error.set("Impossible de charger la liste des employés.");
          return of([]);
        })
      )
      .subscribe((response: any) => {
        const list = Array.isArray(response)
          ? response
          : response?.items || response?.data || [];

        this.employees.set(list);
      });
  }

  employeeLabel(employee: EmployeeLite | null | undefined): string {
    if (!employee) return 'Employé';

    const fullName =
      employee.fullName ||
      `${employee.firstName ?? ''} ${employee.lastName ?? ''}`.trim() ||
      employee.name ||
      'Employé';

    return employee.badgeId ? `${fullName} • ${employee.badgeId}` : fullName;
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
      const currentEmployeeId = this.participantsFA.at(i).get('employee')?.value;
      if (currentEmployeeId === employeeId) {
        this.participantsFA.removeAt(i);
      }
    }

    this.selectedEmployeeIds.set(
      this.selectedEmployeeIds().filter((id) => id !== employeeId)
    );
  }

  submit(): void {
    this.error.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Veuillez corriger les champs obligatoires.');
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

    const dto: CreateTrainingDto = {
      title: String(value.title || '').trim(),
      description: value.description?.trim() || undefined,
      category: value.category as TrainingCategory,
      provider: value.provider?.trim() || undefined,
      location: value.location?.trim() || undefined,
      startDate: new Date(String(value.startDate)).toISOString(),
      endDate: value.endDate
        ? new Date(String(value.endDate)).toISOString()
        : undefined,
      status: value.status as TrainingStatus,
      participants: (value.participants || []).map((participant: any) => ({
        employee: participant.employee,
        status: participant.status || 'planned',
        score:
          participant.score !== null &&
          participant.score !== undefined &&
          participant.score !== ''
            ? Number(participant.score)
            : undefined,
        validUntil: participant.validUntil
          ? new Date(participant.validUntil).toISOString()
          : undefined,
        note: participant.note?.trim() || undefined,
      })),
    };

    this.isLoading.set(true);

    this.trainingsService
      .createTraining(dto)
      .pipe(
        catchError((err) => {
          console.error('Create training error:', err);
          this.error.set(err?.error?.message || 'Création échouée.');
          return of(null);
        }),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe((res) => {
        if (!res) return;
        this.router.navigate(['/manager/trainings']);
      });
  }
}