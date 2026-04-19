import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  FormControl,
  FormGroup,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import {
  DeviceServices,
  Device,
  DeviceStatus,
  UpdateDevicePayload,
} from '../../../../core/services/devices/device-services';

import { ZoneServices, Zone } from '../../../../core/services/zones/zone-services';

type EditDeviceForm = FormGroup<{
  deviceId: FormControl<string>;
  name: FormControl<string>;
  zone: FormControl<string>;
  sensorsText: FormControl<string>;
  status: FormControl<DeviceStatus>;
  description: FormControl<string>;
}>;

@Component({
  selector: 'app-edit-device',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslateModule],
  templateUrl: './edit-device.html',
  styleUrl: './edit-device.scss',
})
export class EditDevice {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private deviceService = inject(DeviceServices);
  private zoneService = inject(ZoneServices);

  id = '';
  device: Device | null = null;

  loading = true;
  saving = false;
  loadingZones = true;

  errorKey = '';
  successKey = '';

  zones: Zone[] = [];

  form: EditDeviceForm = this.fb.nonNullable.group({
    deviceId: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.minLength(3),
    ]),
    name: this.fb.nonNullable.control(''),
    zone: this.fb.nonNullable.control('', [Validators.required]),
    sensorsText: this.fb.nonNullable.control(''),
    status: this.fb.nonNullable.control<DeviceStatus>('offline', [
      Validators.required,
    ]),
    description: this.fb.nonNullable.control(''),
  }) as EditDeviceForm;

  constructor() {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    this.loadZonesAndDevice();
  }

  // =============================
  // LOAD DATA
  // =============================

  loadZonesAndDevice() {
    if (!this.id) {
      this.errorKey = 'DEVICES.ERROR.NOT_FOUND';
      this.loading = false;
      return;
    }

    this.loading = true;
    this.loadingZones = true;
    this.errorKey = '';
    this.successKey = '';

    // 1️⃣ Load zones
    this.zoneService.getAllZones().subscribe({
      next: (res: any) => {
        this.zones = res?.items ?? res?.zones ?? res ?? [];
        this.loadingZones = false;

        // 2️⃣ Load device after zones
        this.loadDevice();
      },
      error: () => {
        this.loadingZones = false;
        this.loading = false;
        this.errorKey = 'DEVICES.ERROR.LOAD_ZONES';
      },
    });
  }

  loadDevice() {
    this.deviceService.getDeviceById(this.id).subscribe({
      next: (res: any) => {
        const d: Device = res?.device ?? res;
        this.device = d;

        const zoneId =
          typeof d.zone === 'object'
            ? (d.zone as any)?._id
            : (d.zone as string);

        this.form.patchValue({
          deviceId: d.deviceId ?? '',
          name: d.name ?? '',
          zone: zoneId ?? '',
          sensorsText: Array.isArray(d.sensors)
            ? d.sensors.join(', ')
            : '',
          status: (d.status ?? 'offline') as DeviceStatus,
          description: d.description ?? '',
        });

        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorKey = 'DEVICES.ERROR.LOAD_ONE';
      },
    });
  }

  // =============================
  // SUBMIT
  // =============================

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.errorKey = '';
    this.successKey = '';

    const payload: UpdateDevicePayload = {
      deviceId: this.form.controls.deviceId.value.trim(),
      name: this.form.controls.name.value.trim(),
      zone: this.form.controls.zone.value,
      sensors: this.parseSensors(this.form.controls.sensorsText.value),
      status: this.form.controls.status.value,
      description: this.form.controls.description.value.trim(),
    };

    this.deviceService.editDevice(this.id, payload).subscribe({
      next: () => {
        this.saving = false;
        this.successKey = 'DEVICES.SUCCESS.UPDATED';

        setTimeout(() => {
          this.router.navigateByUrl('/admin/devices');
        }, 600);
      },
      error: () => {
        this.saving = false;
        this.errorKey = 'DEVICES.ERROR.UPDATE';
      },
    });
  }

  // =============================
  // HELPERS
  // =============================

  parseSensors(text: string): string[] {
    if (!text?.trim()) return [];

    return text
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
  }

  // =============================
  // GETTERS (for template validation)
  // =============================

  get deviceId() {
    return this.form.controls.deviceId;
  }

  get zone() {
    return this.form.controls.zone;
  }
}