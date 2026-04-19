import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { catchError, finalize, of } from 'rxjs';

import {
  EmployeeServices,
  Employee,
} from '../../../../core/services/employees/employee-services';

@Component({
  selector: 'app-all-employees',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TranslateModule,
    DatePipe,
  ],
  templateUrl: './all-employees.html',
  styleUrl: './all-employees.scss',
})
export class AllEmployees {
  private employeeService = inject(EmployeeServices);
  private t = inject(TranslateService);

  loading = signal(false);
  error = signal<string | null>(null);

  // filters
  q = signal('');
  department = signal('');
  active = signal('');

  // data
  employees = signal<Employee[]>([]);

  // pagination
  page = signal(1);
  pageSize = signal(10);

  total = computed(() => this.employees().length);
  pages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));

  pagedEmployees = computed(() => {
    const start = (this.page() - 1) * this.pageSize();
    return this.employees().slice(start, start + this.pageSize());
  });

  ngOnInit() {
    this.loadEmployees();
  }

  trackById = (_: number, e: Employee) => e._id;

  loadEmployees() {
    this.loading.set(true);
    this.error.set(null);

    this.employeeService
      .getAllEmployees()
      .pipe(
        catchError((err) => {
          this.error.set(
            err?.error?.message ?? this.t.instant('EMPLOYEES.ERROR.LOAD')
          );
          return of([] as Employee[]);
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe((res: any) => {
        const items = res?.items ?? res ?? [];
        let list: Employee[] = Array.isArray(items) ? items : [];

        const q = this.q().trim().toLowerCase();
        const department = this.department().trim().toLowerCase();
        const active = this.active().trim().toLowerCase();

        if (q) {
          list = list.filter((e: any) => {
            const fullName = (e?.fullName ?? '').toLowerCase();
            const employeeId = (e?.employeeId ?? '').toLowerCase();
            const jobTitle = (e?.jobTitle ?? '').toLowerCase();
            return (
              fullName.includes(q) ||
              employeeId.includes(q) ||
              jobTitle.includes(q)
            );
          });
        }

        if (department) {
          list = list.filter((e: any) =>
            String(e?.department ?? '').toLowerCase().includes(department)
          );
        }

        if (active) {
          list = list.filter((e: any) => {
            const isActive = !!e?.isActive;
            if (active === 'active') return isActive;
            if (active === 'inactive') return !isActive;
            return true;
          });
        }

        this.employees.set(list);
        this.page.set(1);
      });
  }

  onSearch() {
    this.page.set(1);
    this.loadEmployees();
  }

  clearFilters() {
    this.q.set('');
    this.department.set('');
    this.active.set('');
    this.page.set(1);
    this.loadEmployees();
  }

  prev() {
    if (this.page() > 1) {
      this.page.update(v => v - 1);
    }
  }

  next() {
    if (this.page() < this.pages()) {
      this.page.update(v => v + 1);
    }
  }

  getRowId(e: Employee): string {
    return e._id ?? '';
  }

  activeKey(e: Employee): string {
    return e.isActive
      ? 'EMPLOYEES.STATUS.ACTIVE'
      : 'EMPLOYEES.STATUS.INACTIVE';
  }

  badgeClass(e: Employee): string {
    return e.isActive ? 'ok' : 'bad';
  }

  deleteEmployee(id: string) {
    const msg = this.t.instant('EMPLOYEES.CONFIRM_DELETE');
    if (!confirm(msg)) return;

    this.loading.set(true);
    this.error.set(null);

    this.employeeService
      .deleteEmployee(id)
      .pipe(
        catchError((err) => {
          this.error.set(
            err?.error?.message ?? this.t.instant('EMPLOYEES.ERROR.DELETE')
          );
          return of(null);
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe((res) => {
        if (res === null) return;

        const next = this.employees().filter(e => e._id !== id);
        this.employees.set(next);

        if (this.page() > this.pages()) {
          this.page.set(this.pages());
        }
      });
  }

  toggleActive(e: Employee) {
    if (!e._id) return;

    const nextValue = !e.isActive;

    this.employeeService.toggleActive(e._id, nextValue).subscribe({
      next: () => {
        this.employees.update(arr =>
          arr.map(item =>
            item._id === e._id ? { ...item, isActive: nextValue } : item
          )
        );
      },
      error: () => {
        this.error.set(this.t.instant('EMPLOYEES.ERROR.TOGGLE_ACTIVE'));
      },
    });
  }
}