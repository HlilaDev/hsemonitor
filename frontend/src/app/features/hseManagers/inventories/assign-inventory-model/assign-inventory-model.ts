import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

export type AssignStrategy = 'individual' | 'all_current_zone_employees';

export interface AssignInventoryEmployee {
  _id: string;
  fullName: string;
  employeeId?: string | null;
  department?: string | null;
  jobTitle?: string | null;
  zone?: string | { _id?: string; name?: string } | null;
  isActive?: boolean;
}

export interface AssignInventoryItem {
  _id: string;
  name: string;
  inventoryCode?: string;
  category?: string;
  subCategory?: string;
  status?: string;
  zone?: string | { _id?: string; name?: string } | null;
  quantity?: number;
  unit?: string;
}

export interface AssignInventoryPayload {
  strategy: AssignStrategy;
  employee?: string;
  assignedAt: string;
  assignmentType: 'temporary' | 'permanent';
  expectedReturnDate?: string;
  note: string;
}

@Component({
  selector: 'app-assign-inventory-model',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assign-inventory-model.html',
  styleUrl: './assign-inventory-model.scss',
})
export class AssignInventoryModel {
  @Input() open = false;
  @Input() loading = false;
  @Input() item: AssignInventoryItem | null = null;
  @Input() employees: AssignInventoryEmployee[] = [];
  @Input() currentZoneEmployees: AssignInventoryEmployee[] = [];
  @Input() errorMessage = '';

  @Output() close = new EventEmitter<void>();
  @Output() assign = new EventEmitter<AssignInventoryPayload>();

  strategy = signal<AssignStrategy>('individual');
  search = signal('');
  employee = signal('');
  assignmentType = signal<'temporary' | 'permanent'>('temporary');
  assignedAt = signal(this.getTodayDate());
  expectedReturnDate = signal('');
  note = signal('');
  submitted = signal(false);

  filteredEmployees = computed(() => {
    const term = this.search().trim().toLowerCase();

    if (!term) {
      return this.employees.filter((employee) => employee.isActive !== false);
    }

    return this.employees.filter((employee) => {
      if (employee.isActive === false) return false;

      const fullName = (employee.fullName || '').toLowerCase();
      const employeeId = (employee.employeeId || '').toLowerCase();
      const department = (employee.department || '').toLowerCase();
      const jobTitle = (employee.jobTitle || '').toLowerCase();

      return (
        fullName.includes(term) ||
        employeeId.includes(term) ||
        department.includes(term) ||
        jobTitle.includes(term)
      );
    });
  });

  selectedEmployee = computed(() => {
    return this.employees.find((employee) => employee._id === this.employee()) || null;
  });

  currentZoneName = computed(() => {
    const zone = this.item?.zone;
    if (!zone) return '—';
    return typeof zone === 'string' ? zone : zone.name || '—';
  });

  currentZoneEmployeeCount = computed(() => {
    return this.currentZoneEmployees.filter((employee) => employee.isActive !== false).length;
  });

  get isTemporary(): boolean {
    return this.assignmentType() === 'temporary';
  }

  get isIndividual(): boolean {
    return this.strategy() === 'individual';
  }

  get isAllCurrentZoneEmployees(): boolean {
    return this.strategy() === 'all_current_zone_employees';
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget && !this.loading) {
      this.onClose();
    }
  }

  onClose(): void {
    if (this.loading) return;
    this.close.emit();
  }

  onStrategyChange(value: AssignStrategy): void {
    this.strategy.set(value);
    this.employee.set('');
    this.submitted.set(false);
  }

  onSubmit(): void {
    this.submitted.set(true);

    if (!this.assignedAt()) {
      return;
    }

    if (this.isIndividual && !this.employee()) {
      return;
    }

    if (this.isAllCurrentZoneEmployees && this.currentZoneEmployeeCount() === 0) {
      return;
    }

    const payload: AssignInventoryPayload = {
      strategy: this.strategy(),
      assignedAt: this.assignedAt(),
      assignmentType: this.assignmentType(),
      note: this.note().trim(),
    };

    if (this.isIndividual) {
      payload.employee = this.employee();
    }

    if (this.isTemporary && this.expectedReturnDate()) {
      payload.expectedReturnDate = this.expectedReturnDate();
    }

    this.assign.emit(payload);
  }

  resetForm(): void {
    this.strategy.set('individual');
    this.search.set('');
    this.employee.set('');
    this.assignmentType.set('temporary');
    this.assignedAt.set(this.getTodayDate());
    this.expectedReturnDate.set('');
    this.note.set('');
    this.submitted.set(false);
  }

  getEmployeeZoneName(employee: AssignInventoryEmployee): string {
    if (!employee.zone) return '—';
    return typeof employee.zone === 'string' ? employee.zone : employee.zone.name || '—';
  }

  private getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }
}