import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';

import { API_URLS } from '../../../../core/config/api_urls';
import { ZoneServices, Zone } from '../../../../core/services/zones/zone-services';
import {
  EmployeeServices,
  Employee,
} from '../../../../core/services/employees/employee-services';

type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
type IncidentPriority = 'low' | 'normal' | 'high' | 'urgent';

type ManualIncidentType =
  | 'FALL'
  | 'INJURY'
  | 'FIRE_ALERT'
  | 'LEAK'
  | 'WORK_ACCIDENT'
  | 'MANUAL_REPORT'
  | 'OTHER';

@Component({
  selector: 'app-add-incident',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './add-incident.html',
  styleUrl: './add-incident.scss',
})
export class AddIncident implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private zoneService = inject(ZoneServices);
  private employeeService = inject(EmployeeServices);

  today = new Date();

  isSubmitting = signal(false);
  isLoadingZones = signal(false);
  isLoadingEmployees = signal(false);
  submitError = signal<string | null>(null);

  zones = signal<Zone[]>([]);
  employees = signal<Employee[]>([]);

  selectedFiles = signal<File[]>([]);
  imagePreviews = signal<string[]>([]);

  incidentTypes: {
    value: ManualIncidentType;
    label: string;
    icon: string;
    severity: IncidentSeverity;
  }[] = [
    {
      value: 'FALL',
      label: 'Chute',
      icon: 'bi-person-down',
      severity: 'high',
    },
    {
      value: 'INJURY',
      label: 'Blessure',
      icon: 'bi-bandaid',
      severity: 'high',
    },
    {
      value: 'FIRE_ALERT',
      label: 'Incendie observé',
      icon: 'bi-fire',
      severity: 'critical',
    },
    {
      value: 'LEAK',
      label: 'Fuite signalée par agent',
      icon: 'bi-cloud-haze2',
      severity: 'critical',
    },
    {
      value: 'WORK_ACCIDENT',
      label: 'Accident de travail',
      icon: 'bi-heart-pulse',
      severity: 'critical',
    },
    {
      value: 'MANUAL_REPORT',
      label: 'Signalement manuel',
      icon: 'bi-pencil-square',
      severity: 'medium',
    },
  ];

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    type: ['MANUAL_REPORT' as ManualIncidentType, Validators.required],
    zone: ['', Validators.required],
    employee: [''],
    severity: ['medium' as IncidentSeverity, Validators.required],
    priority: ['normal' as IncidentPriority, Validators.required],
  });

  selectedType = computed(() => {
    const type = this.form.controls.type.value;
    return this.incidentTypes.find((item) => item.value === type);
  });

  ngOnInit(): void {
    this.loadZones();

    this.form.controls.zone.valueChanges.subscribe((zoneId) => {
      this.form.patchValue({ employee: '' }, { emitEvent: false });
      this.employees.set([]);

      if (zoneId) {
        this.loadEmployeesByZone(zoneId);
      }
    });

    this.form.controls.type.valueChanges.subscribe(() => {
      const severity = this.selectedType()?.severity ?? 'medium';
      this.form.patchValue({ severity }, { emitEvent: false });
    });
  }

  loadZones(): void {
    this.isLoadingZones.set(true);

    this.zoneService.getAllZones(undefined, true).subscribe({
      next: (res) => {
        this.zones.set(res.items ?? []);
        this.isLoadingZones.set(false);
      },
      error: () => {
        this.zones.set([]);
        this.isLoadingZones.set(false);
      },
    });
  }

  loadEmployeesByZone(zoneId: string): void {
    this.isLoadingEmployees.set(true);

    this.employeeService.getEmployeesByZone(zoneId).subscribe({
      next: (employees) => {
        this.employees.set(employees ?? []);
        this.isLoadingEmployees.set(false);
      },
      error: () => {
        this.employees.set([]);
        this.isLoadingEmployees.set(false);
      },
    });
  }

  selectType(type: ManualIncidentType): void {
    const selected = this.incidentTypes.find((item) => item.value === type);

    this.form.patchValue({
      type,
      severity: selected?.severity ?? 'medium',
    });
  }

  onImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);

    if (!files.length) return;

    const validFiles = files.filter((file) => file.type.startsWith('image/'));
    const mergedFiles = [...this.selectedFiles(), ...validFiles].slice(0, 6);

    this.selectedFiles.set(mergedFiles);
    this.generatePreviews(mergedFiles);

    input.value = '';
  }

  removeImage(index: number): void {
    const files = this.selectedFiles().filter((_, i) => i !== index);
    this.selectedFiles.set(files);
    this.generatePreviews(files);
  }

  private generatePreviews(files: File[]): void {
    this.imagePreviews.set([]);

    files.forEach((file) => {
      const reader = new FileReader();

      reader.onload = () => {
        this.imagePreviews.update((items) => [...items, String(reader.result)]);
      };

      reader.readAsDataURL(file);
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set(null);

    const value = this.form.getRawValue();

const payload = {
  title: value.title.trim(),
  description: value.description.trim(),
  type: value.type,
  zone: value.zone,
  employee: value.employee || undefined,
  severity: value.severity,
  priority: value.priority,
  images: [],
};

    this.http
      .post(API_URLS.incidentEvents.create, payload, {
        withCredentials: true,
      })
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.router.navigate(['/manager/incidents']);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.submitError.set(
            err?.error?.message || 'Impossible de créer l’incident.'
          );
        },
      });
  }

  reset(): void {
    this.form.reset({
      title: '',
      description: '',
      type: 'MANUAL_REPORT',
      zone: '',
      employee: '',
      severity: 'medium',
      priority: 'normal',
    });

    this.employees.set([]);
    this.selectedFiles.set([]);
    this.imagePreviews.set([]);
    this.submitError.set(null);
  }

  getZoneName(zone: Zone): string {
    return zone?.name || 'Zone sans nom';
  }

  getEmployeeName(employee: Employee): string {
    return employee?.fullName || 'Employé sans nom';
  }

  getEmployeeInfo(employee: Employee): string {
    const job = employee?.jobTitle || 'Poste non défini';
    const id = employee?.employeeId || 'ID non défini';
    return `${job} • ${id}`;
  }

  fieldInvalid(field: 'title' | 'description' | 'zone'): boolean {
    const control = this.form.controls[field];
    return control.invalid && (control.dirty || control.touched);
  }
}