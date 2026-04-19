import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import {
  Employee,
  EmployeeServices,
} from '../../../../core/services/employees/employee-services';

type TrainingItem = {
  _id?: string;
  title?: string;
  status?: string;
  date?: string | Date | null;
  score?: number | null;
  certificate?: boolean;
};

@Component({
  selector: 'app-employee-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './employee-profile.html',
  styleUrl: './employee-profile.scss',
})
export class EmployeeProfile {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private employeeSrv = inject(EmployeeServices);

  readonly loading = signal<boolean>(true);
  readonly saving = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  readonly employee = signal<Employee | null>(null);
  readonly editMode = signal<boolean>(false);

  readonly trainings = computed<TrainingItem[]>(() => {
    const e: any = this.employee();
    const list = e?.trainings ?? e?.trainingHistory ?? e?.completedTrainings ?? [];
    return Array.isArray(list) ? list : [];
  });

  readonly initials = computed(() => {
    const name = this.employee()?.fullName?.trim() || '';
    if (!name) return '—';
    const parts = name.split(/\s+/).slice(0, 2);
    return parts.map((p) => p[0]?.toUpperCase()).join('');
  });

  readonly zoneLabel = computed(() => {
    const z: any = this.employee()?.zone;
    if (!z) return '—';
    if (typeof z === 'string') return z;
    return z?.name || z?._id || '—';
  });

  readonly statusKey = computed(() =>
    this.employee()?.isActive
      ? 'EMPLOYEES.STATUS.ACTIVE'
      : 'EMPLOYEES.STATUS.INACTIVE'
  );

  readonly profileImage = computed(() => {
    const e: any = this.employee();
    return e?.photoUrl || e?.avatar || e?.imageUrl || '';
  });

  form = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    employeeId: [''],
    department: [''],
    jobTitle: [''],
    zone: [''],
    phone: [''],
    hireDate: [''],
    isActive: [true],
  });

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading.set(false);
      this.error.set('EMPLOYEES.ERROR.MISSING_ID');
      return;
    }
    this.loadEmployee(id);
  }

  private patchForm(e: Employee) {
    const zoneId =
      typeof e.zone === 'string'
        ? e.zone
        : ((e.zone as any)?._id ?? '');

    const hireDate = e.hireDate ? this.toDateInputValue(e.hireDate) : '';

    this.form.patchValue({
      fullName: e.fullName ?? '',
      employeeId: e.employeeId ?? '',
      department: e.department ?? '',
      jobTitle: e.jobTitle ?? '',
      zone: zoneId,
      phone: e.phone ?? '',
      hireDate,
      isActive: e.isActive ?? true,
    });
  }

  private toDateInputValue(d: string | Date) {
    const date = new Date(d);
    if (Number.isNaN(date.getTime())) return '';
    const yyyy = String(date.getFullYear());
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  loadEmployee(id: string) {
    this.loading.set(true);
    this.error.set(null);

    this.employeeSrv.getEmployeeById(id).subscribe({
      next: (res: any) => {
        const e = res as Employee;
        this.employee.set(e);
        this.patchForm(e);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.loading.set(false);
        this.error.set(err?.message || 'EMPLOYEES.ERROR.LOAD_ONE');
      },
    });
  }

  toggleEdit() {
    const e = this.employee();
    if (!e) return;

    if (!this.editMode()) {
      this.patchForm(e);
      this.editMode.set(true);
      return;
    }

    this.editMode.set(false);
  }

  save() {
    const e = this.employee();
    if (!e?._id) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    const payload = {
      ...this.form.value,
      hireDate: this.form.value.hireDate ? this.form.value.hireDate : null,
      zone: this.form.value.zone ? this.form.value.zone : null,
    };

    this.employeeSrv.updateEmployee(e._id, payload).subscribe({
      next: (updated: any) => {
        this.employee.set(updated as Employee);
        this.patchForm(updated as Employee);
        this.editMode.set(false);
        this.saving.set(false);
      },
      error: (err: any) => {
        this.saving.set(false);
        this.error.set(err?.message || 'EMPLOYEES.ERROR.UPDATE');
      },
    });
  }

  toggleEmployeeStatus() {
    const e = this.employee();
    if (!e?._id) return;

    const nextActive = !(e.isActive ?? true);

    this.saving.set(true);
    this.error.set(null);

    this.employeeSrv.toggleActive(e._id, nextActive).subscribe({
      next: (updated: any) => {
        this.employee.set(updated as Employee);
        this.patchForm(updated as Employee);
        this.saving.set(false);
      },
      error: (err: any) => {
        this.saving.set(false);
        this.error.set(err?.message || 'EMPLOYEES.ERROR.TOGGLE_ACTIVE');
      },
    });
  }

  deleteEmployee() {
    const e = this.employee();
    if (!e?._id) return;

    const ok = confirm('Delete this employee permanently?');
    if (!ok) return;

    this.saving.set(true);
    this.error.set(null);

    this.employeeSrv.deleteEmployee(e._id).subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/admin/employees']);
      },
      error: (err: any) => {
        this.saving.set(false);
        this.error.set(err?.message || 'EMPLOYEES.ERROR.DELETE');
      },
    });
  }

  back() {
    this.router.navigate(['/admin/employees']);
  }

  value(v: any): string {
    return v === null || v === undefined || v === '' ? '—' : String(v);
  }

  trainingStatusKey(status: any): string {
    const s = String(status ?? 'completed').toLowerCase();
    return `TRAININGS.STATUS.${s}`;
  }

  trainingBadgeClass(status: any): string {
    const s = String(status ?? 'completed').toLowerCase();
    if (s === 'completed') return 'ok';
    if (s === 'planned' || s === 'pending') return 'warn';
    return 'bad';
  }
}