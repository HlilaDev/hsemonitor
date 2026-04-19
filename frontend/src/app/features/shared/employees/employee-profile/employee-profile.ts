import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import {
  Employee,
  EmployeeServices,
} from '../../../../core/services/employees/employee-services';

import {
  InventoryAssignment,
  InventoryItem,
  InventoryServices,
} from '../../../../core/services/inventory/inventory-services';

type TrainingItem = {
  _id?: string;
  title?: string;
  status?: string;
  date?: string | Date | null;
  score?: number | null;
  certificate?: boolean;
};

type EmployeeProfileData = Employee & {
  trainings?: TrainingItem[];
  trainingHistory?: TrainingItem[];
  completedTrainings?: TrainingItem[];
  activeInventoryAssignments?: InventoryAssignment[];
  inventoryAssignments?: InventoryAssignment[];
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
  private inventorySrv = inject(InventoryServices);

  readonly loading = signal<boolean>(true);
  readonly saving = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  readonly inventoryLoading = signal<boolean>(true);
  readonly inventoryError = signal<string | null>(null);

  readonly employee = signal<EmployeeProfileData | null>(null);
  readonly editMode = signal<boolean>(false);
  readonly inventoryAssignmentsRaw = signal<InventoryAssignment[]>([]);

  readonly trainings = computed<TrainingItem[]>(() => {
    const e = this.employee();
    const list =
      e?.trainings ?? e?.trainingHistory ?? e?.completedTrainings ?? [];
    return Array.isArray(list) ? list : [];
  });

  readonly inventoryAssignments = computed<InventoryAssignment[]>(() => {
    const list = this.inventoryAssignmentsRaw();
    if (!Array.isArray(list)) return [];

    return list.filter((a) => {
      const status = String(a?.status ?? '').toLowerCase();
      return status !== 'returned' && status !== 'cancelled';
    });
  });

  readonly activeAssignmentsCount = computed(() =>
    this.inventoryAssignments().filter(
      (a) => String(a?.status ?? '').toLowerCase() === 'active'
    ).length
  );

  readonly overdueAssignmentsCount = computed(() =>
    this.inventoryAssignments().filter(
      (a) => String(a?.status ?? '').toLowerCase() === 'overdue'
    ).length
  );

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

  readonly form = this.fb.nonNullable.group({
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
      this.inventoryLoading.set(false);
      this.error.set('EMPLOYEES.ERROR.MISSING_ID');
      return;
    }

    this.loadEmployee(id);
    this.loadInventoryAssignments(id);
  }

  private extractEmployee(res: any): EmployeeProfileData {
    return (res?.employee ?? res?.data ?? res) as EmployeeProfileData;
  }

  private patchForm(e: EmployeeProfileData) {
    const zoneId =
      typeof e.zone === 'string' ? e.zone : ((e.zone as any)?._id ?? '');

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

  private hydrateAssignmentsFromEmployee(e: EmployeeProfileData | null) {
    if (!e) return;

    const embedded =
      e.activeInventoryAssignments ?? e.inventoryAssignments ?? [];

    if (Array.isArray(embedded) && embedded.length > 0) {
      this.inventoryAssignmentsRaw.set(embedded);
    }
  }

  loadEmployee(id: string) {
    this.loading.set(true);
    this.error.set(null);

    this.employeeSrv.getEmployeeById(id).subscribe({
      next: (res: any) => {
        const e = this.extractEmployee(res);
        this.employee.set(e);
        this.patchForm(e);
        this.hydrateAssignmentsFromEmployee(e);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.loading.set(false);
        this.error.set(err?.message || 'EMPLOYEES.ERROR.LOAD_ONE');
      },
    });
  }

  loadInventoryAssignments(employeeId: string) {
    this.inventoryLoading.set(true);
    this.inventoryError.set(null);

    this.inventorySrv
      .getInventoryAssignments({
        employee: employeeId,
        page: 1,
        limit: 100,
        sortBy: 'assignedAt',
        order: 'desc',
      })
      .subscribe({
        next: (res) => {
          const list = Array.isArray(res?.assignments) ? res.assignments : [];
          this.inventoryAssignmentsRaw.set(list);
          this.inventoryLoading.set(false);
        },
        error: (err: any) => {
          this.inventoryLoading.set(false);
          this.inventoryError.set(
            err?.message || 'Erreur lors du chargement des affectations'
          );
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

    const raw = this.form.getRawValue();

    const payload = {
      ...raw,
      hireDate: raw.hireDate ? raw.hireDate : null,
      zone: raw.zone ? raw.zone : null,
    };

    this.employeeSrv.updateEmployee(e._id, payload).subscribe({
      next: (updatedRes: any) => {
        const updated = this.extractEmployee(updatedRes);
        this.employee.set(updated);
        this.patchForm(updated);
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
      next: (updatedRes: any) => {
        const updated = this.extractEmployee(updatedRes);
        this.employee.set(updated);
        this.patchForm(updated);
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

    const ok = confirm('Supprimer définitivement cet employé ?');
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


  trainingBadgeClass(status: any): string {
    const s = String(status ?? 'completed').toLowerCase();
    if (s === 'completed') return 'ok';
    if (s === 'planned' || s === 'pending') return 'warn';
    return 'bad';
  }

  inventoryStatusLabel(status: any): string {
    const s = String(status ?? 'active').toLowerCase();

    if (s === 'active') return 'Active';
    if (s === 'overdue') return 'En retard';
    if (s === 'returned') return 'Retournée';
    if (s === 'cancelled') return 'Annulée';

    return this.value(status);
  }

  inventoryStatusClass(status: any): string {
    const s = String(status ?? 'active').toLowerCase();

    if (s === 'active') return 'ok';
    if (s === 'overdue') return 'bad';
    if (s === 'returned') return 'neutral';
    if (s === 'cancelled') return 'neutral';

    return 'warn';
  }

  assignmentTypeLabel(type: any): string {
    const t = String(type ?? '').toLowerCase();

    if (t === 'individual') return 'Individuelle';
    if (t === 'zone') return 'Zone';
    if (t === 'temporary') return 'Temporaire';
    if (t === 'permanent') return 'Permanente';

    return '—';
  }

  inventoryItemName(assignment: InventoryAssignment): string {
    const item = assignment?.inventoryItem;

    if (!item) return '—';
    if (typeof item === 'string') return item;

    return item.name || item.inventoryCode || item._id || '—';
  }

  inventoryItemCode(assignment: InventoryAssignment): string {
    const item = assignment?.inventoryItem;

    if (!item || typeof item === 'string') return '—';

    return item.inventoryCode || item.serialNumber || '—';
  }

  inventoryItemCategory(assignment: InventoryAssignment): string {
    const item = assignment?.inventoryItem;

    if (!item || typeof item === 'string') return '—';

    return item.category || '—';
  }

  inventoryItemCondition(assignment: InventoryAssignment): string {
    const item = assignment?.inventoryItem;

    if (!item || typeof item === 'string') return '—';

    return item.condition || '—';
  }

  inventoryItemUnit(assignment: InventoryAssignment): string {
    const item = assignment?.inventoryItem;

    if (!item || typeof item === 'string') return '—';

    return item.unit || '—';
  }

  inventoryItemQuantity(assignment: InventoryAssignment): string {
    const item = assignment?.inventoryItem as InventoryItem | string | undefined;

    if (!item || typeof item === 'string') return '—';

    if (item.quantity === null || item.quantity === undefined) return '—';
    return String(item.quantity);
  }

  assignmentZoneLabel(assignment: InventoryAssignment): string {
    const zone: any = assignment?.zone;
    if (!zone) return '—';
    if (typeof zone === 'string') return zone;

    return zone?.name || zone?._id || '—';
  }

  assignedByLabel(assignment: InventoryAssignment): string {
    const user: any = assignment?.assignedBy;

    if (!user) return '—';
    if (typeof user === 'string') return user;

    const name = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
    return name || user.email || user._id || '—';
  }
}