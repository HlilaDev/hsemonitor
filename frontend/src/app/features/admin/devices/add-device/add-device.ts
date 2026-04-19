import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  FormControl,
  FormGroup,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';

import {
  DeviceServices,
  CreateDevicePayload,
} from '../../../../core/services/devices/device-services';

type AddDeviceForm = FormGroup<{
  name: FormControl<string>;
  deviceId: FormControl<string>;
  description: FormControl<string>;
}>;

@Component({
  selector: 'app-add-device',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './add-device.html',
  styleUrl: './add-device.scss',
})
export class AddDevice {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly deviceService = inject(DeviceServices);
  private readonly destroyRef = inject(DestroyRef);

  saving = false;
  errorKey = '';
  successKey = '';

  existingDeviceIds: string[] = [];

  form: AddDeviceForm = this.fb.nonNullable.group({
    name: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.minLength(2),
    ]),
    deviceId: this.fb.nonNullable.control(
      { value: '', disabled: true },
      [Validators.required]
    ),
    description: this.fb.nonNullable.control(''),
  }) as AddDeviceForm;

  constructor() {
    this.loadExistingDeviceIds();
    this.bindNameToDeviceId();
  }

  private bindNameToDeviceId() {
    this.form.controls.name.valueChanges
      .pipe(
        startWith(this.form.controls.name.value),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((name) => {
        const generated = this.generateUniqueDeviceId(name);
        this.form.controls.deviceId.setValue(generated, { emitEvent: false });
      });
  }

  loadExistingDeviceIds() {
    this.deviceService.getAllDevices().subscribe({
      next: (res: any) => {
        const devices = res?.items ?? res?.devices ?? res ?? [];

        this.existingDeviceIds = devices
          .map((d: any) => String(d?.deviceId ?? '').trim())
          .filter((id: string) => !!id);
      },
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;

    const raw = this.form.getRawValue();

    const payload: CreateDevicePayload = {
      deviceId: raw.deviceId.trim(),
      name: raw.name.trim(),
      description: raw.description.trim(),
      zone: '',
      sensors: [],
      status: 'offline'
    };

    this.deviceService.addDevice(payload).subscribe({
      next: () => {
        this.saving = false;
        this.successKey = 'Device created';
        setTimeout(() => this.router.navigateByUrl('/admin/devices'), 600);
      },
      error: () => {
        this.saving = false;
        this.errorKey = 'Error creating device';
      },
    });
  }

  private generateUniqueDeviceId(name: string): string {
    const base = this.slugify(name);

    if (!base) return '';

    const relatedIds = this.existingDeviceIds.filter(
      (id) => id === base || id.startsWith(`${base}-`)
    );

    if (relatedIds.length === 0) {
      return `${base}-01`;
    }

    let max = 0;

    for (const id of relatedIds) {
      const match = id.match(new RegExp(`^${base}-(\\d+)$`));
      if (match) {
        const val = Number(match[1]);
        if (val > max) max = val;
      }
    }

    return `${base}-${String(max + 1).padStart(2, '0')}`;
  }

  private slugify(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  get name() {
    return this.form.controls.name;
  }
}