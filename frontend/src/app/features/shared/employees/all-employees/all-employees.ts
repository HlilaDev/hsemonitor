import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  Employee,
  EmployeeServices,
} from '../../../../core/services/employees/employee-services';

@Component({
  selector: 'app-all-employees',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './all-employees.html',
  styleUrl: './all-employees.scss',
})
export class AllEmployees {
  private employeeService = inject(EmployeeServices);
  private t = inject(TranslateService);

  employees = signal<Employee[]>([]);
  loading = signal(false);
  error = signal('');

  q = signal('');
  department = signal('');
  zone = signal('');
  status = signal('');

  page = signal(1);
  pageSize = signal(8);

  constructor() {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.loading.set(true);
    this.error.set('');

    this.employeeService.getAllEmployees().subscribe({
      next: (res: any) => {
        const data = res?.items ?? res?.employees ?? res ?? [];
        this.employees.set(Array.isArray(data) ? data : []);
        this.page.set(1);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.error.set(
          err?.message || this.t.instant('EMPLOYEES.ERROR.LOAD')
        );
        this.loading.set(false);
      },
    });
  }

  trackByEmployee = (_: number, e: Employee) => e?._id || e?.employeeId || _;

  getRowId(e: Employee): string {
    return e?._id || '';
  }

  getZoneName(e: Employee): string {
    if (!e?.zone) return '—';
    if (typeof e.zone === 'string') return e.zone;
    return e.zone?.name || '—';
  }

  getDepartment(e: Employee): string {
    return e?.department?.trim() || '—';
  }

  getJobTitle(e: Employee): string {
    return e?.jobTitle?.trim() || '—';
  }

  getStatusKey(e: Employee): string {
    return e?.isActive ? 'COMMON.ACTIVE' : 'COMMON.INACTIVE';
  }

  badgeClass(active?: boolean | null): string {
    return active ? 'ok' : 'bad';
  }

  filteredEmployees = computed(() => {
    const q = this.q().trim().toLowerCase();
    const department = this.department().trim().toLowerCase();
    const zone = this.zone().trim().toLowerCase();
    const status = this.status();

    return this.employees().filter((e) => {
      const fullName = (e.fullName || '').toLowerCase();
      const employeeId = (e.employeeId || '').toLowerCase();
      const phone = (e.phone || '').toLowerCase();
      const departmentValue = (e.department || '').toLowerCase();
      const jobTitle = (e.jobTitle || '').toLowerCase();
      const zoneName = this.getZoneName(e).toLowerCase();

      const matchesSearch =
        !q ||
        fullName.includes(q) ||
        employeeId.includes(q) ||
        phone.includes(q) ||
        jobTitle.includes(q);

      const matchesDepartment =
        !department || departmentValue.includes(department);

      const matchesZone = !zone || zoneName.includes(zone);

      const matchesStatus =
        !status ||
        (status === 'active' && e.isActive === true) ||
        (status === 'inactive' && e.isActive === false);

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesZone &&
        matchesStatus
      );
    });
  });

  total = computed(() => this.filteredEmployees().length);

  pages = computed(() =>
    Math.max(1, Math.ceil(this.total() / this.pageSize()))
  );

  pagedEmployees = computed(() => {
    const start = (this.page() - 1) * this.pageSize();
    return this.filteredEmployees().slice(start, start + this.pageSize());
  });

  activeCount = computed(
    () => this.employees().filter((e) => e.isActive).length
  );

  inactiveCount = computed(
    () => this.employees().filter((e) => !e.isActive).length
  );

  withZoneCount = computed(
    () => this.employees().filter((e) => this.getZoneName(e) !== '—').length
  );

  onSearch(): void {
    this.page.set(1);
  }

  clearFilters(): void {
    this.q.set('');
    this.department.set('');
    this.zone.set('');
    this.status.set('');
    this.page.set(1);
  }

  prev(): void {
    if (this.page() > 1) {
      this.page.update((v) => v - 1);
    }
  }

  next(): void {
    if (this.page() < this.pages()) {
      this.page.update((v) => v + 1);
    }
  }

  toggleActive(employee: Employee): void {
    const id = this.getRowId(employee);
    if (!id) return;

    const nextValue = !employee.isActive;
    const current = this.employees();

    this.employees.set(
      current.map((e) =>
        this.getRowId(e) === id ? { ...e, isActive: nextValue } : e
      )
    );

    this.employeeService.toggleActive(id, nextValue).subscribe({
      next: () => {},
      error: () => {
        this.employees.set(
          current.map((e) =>
            this.getRowId(e) === id ? { ...e, isActive: employee.isActive } : e
          )
        );
        alert(this.t.instant('EMPLOYEES.ERROR.TOGGLE_ACTIVE'));
      },
    });
  }

  deleteEmployee(employee: Employee): void {
    const id = this.getRowId(employee);
    if (!id) return;

    const confirmed = confirm(
      this.t.instant('EMPLOYEES.CONFIRM_DELETE')
    );
    if (!confirmed) return;

    this.employeeService.deleteEmployee(id).subscribe({
      next: () => {
        const updated = this.employees().filter((e) => this.getRowId(e) !== id);
        this.employees.set(updated);

        if (this.page() > this.pages()) {
          this.page.set(this.pages());
        }
      },
      error: () => {
        alert(this.t.instant('EMPLOYEES.ERROR.DELETE'));
      },
    });
  }
}
