import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { EmployeeServices } from '../../../../core/services/employees/employee-services';
import { ZoneServices } from '../../../../core/services/zones/zone-services';

@Component({
  selector: 'app-add-employee',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslateModule],
  templateUrl: './add-employee.html',
  styleUrl: './add-employee.scss',
})
export class AddEmployee {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private employeeService = inject(EmployeeServices);
  private zoneService = inject(ZoneServices);

  zones: any[] = [];

  loadingZones = true;
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
    this.loadZones();
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

  get f() {
    return this.form.controls;
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

    this.employeeService.createEmployee(payload).subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigate(['/admin/employees']);
      },
      error: () => {
        this.submitting = false;
        this.errorMessage = 'EMPLOYEES.ERROR.CREATE';
      },
    });
  }
}