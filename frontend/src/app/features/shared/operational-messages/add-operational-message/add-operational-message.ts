import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { finalize, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import {
  Device,
  DeviceServices,
} from '../../../../core/services/devices/device-services';
import { Zone, ZoneServices } from '../../../../core/services/zones/zone-services';
import { OperationalMessageServices } from '../../../../core/services/operational-messages/operatioanl-message-services';

type TargetType = 'device' | 'zone' | 'broadcast';
type MessageType = 'info' | 'warning' | 'alert' | 'emergency';
type PriorityType = 'low' | 'normal' | 'high' | 'critical';
type DisplayMode = 'once' | 'repeat' | 'persistent';

@Component({
  selector: 'app-add-operational-message',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './add-operational-message.html',
  styleUrl: './add-operational-message.scss',
})
export class AddOperationalMessage implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private deviceServices = inject(DeviceServices);
  private zoneServices = inject(ZoneServices);
  private operationalMessageServices = inject(OperationalMessageServices);

  loading = signal(false);
  loadingReferences = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  devices = signal<Device[]>([]);
  zones = signal<Zone[]>([]);

  readonly messageTypeOptions: { value: MessageType; label: string }[] = [
    { value: 'info', label: 'Info' },
    { value: 'warning', label: 'Warning' },
    { value: 'alert', label: 'Alert' },
    { value: 'emergency', label: 'Emergency' },
  ];

  readonly priorityOptions: { value: PriorityType; label: string }[] = [
    { value: 'low', label: 'Low' },
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
  ];

  readonly targetTypeOptions: { value: TargetType; label: string }[] = [
    { value: 'device', label: 'Device' },
    { value: 'zone', label: 'Zone' },
    { value: 'broadcast', label: 'Broadcast' },
  ];

  readonly displayModeOptions: { value: DisplayMode; label: string }[] = [
    { value: 'once', label: 'Once' },
    { value: 'repeat', label: 'Repeat' },
    { value: 'persistent', label: 'Persistent' },
  ];

  form = this.fb.group({
    title: [''],
    content: ['', [Validators.required, Validators.maxLength(500)]],
    messageType: ['info' as MessageType, Validators.required],
    priority: ['normal' as PriorityType, Validators.required],
    targetType: ['device' as TargetType, Validators.required],
    targetDevice: [''],
    targetZone: [''],
    displayMode: ['once' as DisplayMode, Validators.required],
    durationSeconds: [10, [Validators.required, Validators.min(1), Validators.max(3600)]],
    scheduledAt: [''],
    expiresAt: [''],
    notes: [''],
  });

  readonly targetType = computed(
    () => (this.form.get('targetType')?.value || 'device') as TargetType
  );

  readonly contentLength = computed(
    () => this.form.get('content')?.value?.length || 0
  );

  readonly onlineDevicesCount = computed(
    () => this.devices().filter((device) => device.status === 'online').length
  );

  ngOnInit(): void {
    this.watchTargetType();
    this.updateTargetValidators(this.targetType());
    this.loadReferences();
  }

  private watchTargetType(): void {
    this.form.get('targetType')?.valueChanges.subscribe((value) => {
      this.updateTargetValidators((value || 'device') as TargetType);
    });
  }

  private updateTargetValidators(targetType: TargetType): void {
    const targetDeviceControl = this.form.get('targetDevice');
    const targetZoneControl = this.form.get('targetZone');

    targetDeviceControl?.clearValidators();
    targetZoneControl?.clearValidators();

    if (targetType === 'device') {
      targetDeviceControl?.setValidators([Validators.required]);
      targetZoneControl?.setValue('');
    } else if (targetType === 'zone') {
      targetZoneControl?.setValidators([Validators.required]);
      targetDeviceControl?.setValue('');
    } else {
      targetDeviceControl?.setValue('');
      targetZoneControl?.setValue('');
    }

    targetDeviceControl?.updateValueAndValidity();
    targetZoneControl?.updateValueAndValidity();
  }

  loadReferences(): void {
    this.loadingReferences.set(true);
    this.error.set(null);

    forkJoin({
      devices: this.deviceServices.getAllDevices({ page: 1, limit: 200 }).pipe(
        map((response: any) => {
          if (Array.isArray(response)) {
            return response;
          }

          if (Array.isArray(response?.items)) {
            return response.items;
          }

          if (Array.isArray(response?.data)) {
            return response.data;
          }

          if (Array.isArray(response?.results)) {
            return response.results;
          }

          if (Array.isArray(response?.devices)) {
            return response.devices;
          }

          return [];
        }),
        catchError((error) => {
          console.error('Devices load error:', error);
          return of([]);
        })
      ),

      zones: this.zoneServices.getAllZones().pipe(
        map((response) => response?.items || []),
        catchError((error) => {
          console.error('Zones load error:', error);
          return of([]);
        })
      ),
    })
      .pipe(finalize(() => this.loadingReferences.set(false)))
      .subscribe({
        next: ({ devices, zones }) => {
          this.devices.set(devices);
          this.zones.set(zones);

          console.log('Loaded devices:', devices);
          console.log('Loaded zones:', zones);
        },
        error: (error) => {
          console.error('References load error:', error);
          this.error.set('Impossible de charger les devices et les zones.');
          this.devices.set([]);
          this.zones.set([]);
        },
      });
  }

  submit(): void {
    this.error.set(null);
    this.success.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Veuillez remplir correctement les champs obligatoires.');
      return;
    }

    const value = this.form.getRawValue();

    const payload = {
      title: value.title?.trim() || '',
      content: value.content?.trim() || '',
      messageType: value.messageType || 'info',
      priority: value.priority || 'normal',
      targetType: value.targetType || 'device',
      targetDevice:
        value.targetType === 'device' ? value.targetDevice || null : null,
      targetZone: value.targetType === 'zone' ? value.targetZone || null : null,
      displayMode: value.displayMode || 'once',
      durationSeconds: Number(value.durationSeconds) || 10,
      scheduledAt: value.scheduledAt || null,
      expiresAt: value.expiresAt || null,
      notes: value.notes?.trim() || '',
    };

    this.loading.set(true);

    this.operationalMessageServices
      .createMessage(payload)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.success.set('Message opérationnel créé avec succès.');

          this.form.reset({
            title: '',
            content: '',
            messageType: 'info',
            priority: 'normal',
            targetType: 'device',
            targetDevice: '',
            targetZone: '',
            displayMode: 'once',
            durationSeconds: 10,
            scheduledAt: '',
            expiresAt: '',
            notes: '',
          });

          this.updateTargetValidators('device');
        },
        error: (err) => {
          this.error.set(
            err?.error?.message ||
              'Erreur lors de la création du message opérationnel.'
          );
        },
      });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/operational-messages']);
  }

  fieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!field && field.invalid && (field.dirty || field.touched);
  }

  getDeviceLabel(device: Device): string {
    return device.name?.trim() || device.deviceId || 'Device';
  }

  getZoneLabel(zone: Zone): string {
    return zone.name || 'Zone';
  }
}