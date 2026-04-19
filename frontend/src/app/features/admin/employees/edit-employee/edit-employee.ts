import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { EmployeeServices, Employee } from '../../../../core/services/employees/employee-services';
import { ZoneServices } from '../../../../core/services/zones/zone-services';

@Component({
  selector: 'app-edit-employee',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslateModule],
  templateUrl: './edit-employee.html',
  styleUrl: './edit-employee.scss',
})
export class EditEmployee {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private employeeService = inject(EmployeeServices);
  private zoneService = inject(ZoneServices);

  id = '';
  zones: any[] = [];

  loadingZones = true;
  loadingEmployee = true;
  submitting = false;

  errorMessage = '';

  form = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    employeeId: [''],
    department: [''],
    jobTitle: [''],
    zone: [''],
    phone: [''],
    hireDate: [''],
    isActive: [true],
  });

  constructor() {
    this.id = this.route.snapshot.paramMap.get('id') || '';

    this.loadZones();
    this.loadEmployee();
  }

  get f() {
    return this.form.controls;
  }

  private loadZones() {
    this.loadingZones = true;

    this.zoneService.getAllZones().subscribe({
      next: (res: any) => {
        this.zones = res?.items ?? res?.zones ?? res ?? [];
        this.loadingZones = false;
      },
      error: () => {
        this.zones = [];
        this.loadingZones = false;
      },
    });
  }

  private loadEmployee() {
    if (!this.id) {
      this.errorMessage = 'EMPLOYEES.ERROR.MISSING_ID';
      this.loadingEmployee = false;
      return;
    }

    this.loadingEmployee = true;

    this.employeeService.getEmployeeById(this.id).subscribe({
      next: (emp: Employee | any) => {
        const zoneId =
          typeof emp.zone === 'string' ? emp.zone : (emp.zone?._id ?? '');

        this.form.patchValue({
          fullName: emp.fullName ?? '',
          employeeId: emp.employeeId ?? '',
          department: emp.department ?? '',
          jobTitle: emp.jobTitle ?? '',
          zone: zoneId || '',
          phone: emp.phone ?? '',
          hireDate: this.toDateInput(emp.hireDate),
          isActive: emp.isActive ?? true,
        });

        this.loadingEmployee = false;
      },
      error: () => {
        this.errorMessage = 'EMPLOYEES.ERROR.LOAD_ONE';
        this.loadingEmployee = false;
      },
    });
  }

  submit() {
    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;

    const v = this.form.value;

    const payload: any = {
      fullName: v.fullName?.trim(),
      employeeId: v.employeeId?.trim() || null,
      department: v.department?.trim() || null,
      jobTitle: v.jobTitle?.trim() || null,
      zone: v.zone || null,
      phone: v.phone?.trim() || null,
      hireDate: v.hireDate || null,
      isActive: v.isActive ?? true,
    };

    this.employeeService.updateEmployee(this.id, payload).subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigate(['/admin/employees']);
      },
      error: () => {
        this.submitting = false;
        this.errorMessage = 'EMPLOYEES.ERROR.UPDATE';
      },
    });
  }

  private toDateInput(value: any): string {
    if (!value) return '';
    const d = new Date(value);
    if (isNaN(d.getTime())) return '';
    const yyyy = String(d.getFullYear());
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}