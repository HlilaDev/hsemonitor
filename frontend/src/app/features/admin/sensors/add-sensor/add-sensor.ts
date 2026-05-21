import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';

import {
  CreateSensorDto,
  SensorServices,
  SensorStatus,
  SensorType,
} from '../../../../core/services/sensors/sensor-services';

@Component({
  selector: 'app-add-sensor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './add-sensor.html',
  styleUrl: './add-sensor.scss',
})
export class AddSensor {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private sensorService = inject(SensorServices);

  loading = signal(false);
  error = signal<string | null>(null);

  sensorTypes: { value: SensorType | string; label: string; unit: string }[] = [
    { value: 'temperature', label: 'Température', unit: '°C' },
    { value: 'gas', label: 'Gaz', unit: 'ppm' },
    { value: 'humidity', label: 'Humidité', unit: '%' },
    { value: 'noise', label: 'Bruit', unit: 'raw' },
    { value: 'motion', label: 'Mouvement', unit: '' },
  ];

  statuses: { value: SensorStatus; label: string }[] = [
    { value: 'online', label: 'Online' },
    { value: 'offline', label: 'Offline' },
    { value: 'maintenance', label: 'Maintenance' },
  ];

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    type: ['temperature', [Validators.required]],
    device: ['', [Validators.required]],
    zone: ['', [Validators.required]],
    threshold: [null as number | null],
    unit: ['°C'],
    status: ['offline' as SensorStatus, [Validators.required]],
  });

  canSubmit = computed(() => this.form.valid && !this.loading());

  constructor() {
    this.form.get('type')?.valueChanges.subscribe((type) => {
      const unit = this.sensorTypes.find((t) => t.value === type)?.unit ?? '';
      this.form.patchValue({ unit }, { emitEvent: false });
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();

    const dto: CreateSensorDto = {
      name: v.name?.trim() || '',
      type: v.type || 'temperature',
      device: v.device?.trim() || '',
      zone: v.zone?.trim() || '',
      threshold: v.threshold,
      unit: v.unit?.trim() || '',
    };

    this.loading.set(true);
    this.error.set(null);

    this.sensorService
      .create(dto)
      .pipe(
        catchError((err) => {
          this.error.set(err?.error?.message ?? 'Création du capteur échouée');
          return of(null);
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe((sensor) => {
        if (!sensor) return;
        this.router.navigateByUrl('/admin/sensors');
      });
  }

  fieldInvalid(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  goBack(): void {
    this.router.navigateByUrl('/admin/sensors');
  }
}