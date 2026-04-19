import {
  Component,
  DestroyRef,
  inject,
  signal,
  computed,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';

import {
  SensorServices,
  CreateSensorDto,
  SensorType,
} from '../../../../core/services/sensors/sensor-services';

import { DeviceServices } from '../../../../core/services/devices/device-services';
import { ZoneServices } from '../../../../core/services/zones/zone-services';

type ZoneLite = { _id: string; name: string };

type DeviceLite = {
  _id?: string;
  deviceId?: string;
  name?: string;
  macAddress?: string;
  zone?: any; // string | { _id, name }
};

@Component({
  selector: 'app-add-sensor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './add-sensor.html',
  styleUrl: './add-sensor.scss',
})
export class AddSensor implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  private sensorService = inject(SensorServices);
  private deviceService = inject(DeviceServices);
  private zonesService = inject(ZoneServices, { optional: true });

  loading = signal(false);
  error = signal<string | null>(null);

  devices = signal<DeviceLite[]>([]);
  selectedZone = signal<ZoneLite | null>(null);

  // Signal-based form validity
  formValid = signal(false);

  sensorTypes: { value: SensorType | string; label: string }[] = [
    { value: 'temperature', label: 'Température' },
    { value: 'gas', label: 'Gas' },
    { value: 'humidity', label: 'Humidité' },
    { value: 'noise', label: 'Bruit' },
    { value: 'motion', label: 'Motion' },
  ];

  // ✅ IMPORTANT: device = mongoId (ObjectId)
  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    device: ['', [Validators.required]], // ✅ changed from deviceId
    type: ['temperature', [Validators.required]],
    threshold: [null as number | null],
    unit: [null as string | null],
  });

  // ✅ zone id extracted from selected device (if device.zone is object or string)
  zoneIdFromSelectedDevice = computed(() => {
    const sz = this.selectedZone();
    if (sz?._id && sz._id.trim().length > 0) return sz._id;

    const deviceMongoId = this.form.value.device ?? '';
    if (!deviceMongoId) return null;

    const dev: any = this.devices().find((d) => (d._id ?? '') === deviceMongoId);
    if (!dev) return null;

    const z = dev.zone ?? null;

    if (!z) return null;
    if (typeof z === 'string') return z;
    if (typeof z === 'object' && z._id) return z._id;

    return null;
  });

  hasZoneFromDevice = computed(() => !!this.zoneIdFromSelectedDevice());

  // ✅ submit = formValid + device selected + not loading
  canSubmit = computed(() => this.formValid() && !this.loading());

  ngOnInit() {
    this.loadDevices();

    const statusSub = this.form.statusChanges.subscribe(() => {
      this.formValid.set(this.form.valid);
    });

    const deviceSub = this.form.get('device')!.valueChanges.subscribe((id) => {
      this.onDeviceChange(id ?? '');
    });

    this.destroyRef.onDestroy(() => {
      statusSub.unsubscribe();
      deviceSub.unsubscribe();
    });
  }

  private normalizeDevices(res: any): DeviceLite[] {
    const arr =
      res?.items ??
      res?.devices ??
      res?.data?.items ??
      res?.data?.devices ??
      res;

    return Array.isArray(arr) ? arr : [];
  }

  private loadDevices() {
    this.loading.set(true);
    this.error.set(null);

    this.deviceService
      .getAllDevices()
      .pipe(
        catchError((err) => {
          this.error.set(err?.error?.message ?? 'Erreur chargement devices');
          return of([] as any);
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe((res: any) => {
        const items = this.normalizeDevices(res);

        this.devices.set(
          items.map((d: any) => ({
            _id: d?._id,
            deviceId: d?.deviceId,
            name: d?.name,
            macAddress: d?.macAddress,
            zone: d?.zone, // string OR populated { _id, name }
          }))
        );

        if (this.devices().length === 0) {
          this.error.set('Aucun device trouvé.');
        }

        // auto select first device if empty
        const current = this.form.value.device ?? '';
        if (!current && this.devices().length > 0) {
          this.form.patchValue({ device: this.devices()[0]._id ?? '' });
        } else if (current) {
          this.onDeviceChange(current);
        }

        // sync validity after devices load
        this.formValid.set(this.form.valid);
      });
  }

  onDeviceChange(deviceMongoId: string) {
    this.error.set(null);
    this.selectedZone.set(null);

    if (!deviceMongoId) return;

    const dev: any = this.devices().find((d) => (d._id ?? '') === deviceMongoId);
    if (!dev) return;

    const z = dev.zone ?? null;

    // zone populated object
    if (z && typeof z === 'object' && z._id) {
      this.selectedZone.set({ _id: z._id, name: z.name ?? 'Zone' });
      return;
    }

    // zone is just id string -> fetch zone name if service exists
    if (z && typeof z === 'string') {
      if (this.zonesService && (this.zonesService as any).getZoneById) {
        (this.zonesService as any)
          .getZoneById(z)
          .pipe(catchError(() => of(null)))
          .subscribe((zone: any) => {
            if (zone?._id) this.selectedZone.set({ _id: zone._id, name: zone.name });
            else this.selectedZone.set({ _id: z, name: z });
          });
      } else {
        this.selectedZone.set({ _id: z, name: z });
      }
      return;
    }

    this.error.set("Ce device n'a pas de zone liée (champ zone manquant).");
  }

  submit() {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    // ✅ NEW payload for backend: { name, device, type, threshold?, unit? }
    const dto: CreateSensorDto = {
      name: this.form.value.name!.trim(),
      device: this.form.value.device!, // ✅ mongoId
      type: this.form.value.type!,
      threshold: this.form.value.threshold ?? null,
      unit: this.form.value.unit ?? null,
    } as any;

    this.sensorService
      .create(dto)
      .pipe(
        catchError((err) => {
          this.error.set(err?.error?.message ?? 'Création du capteur échouée');
          return of(null);
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe((created) => {
        if (!created) return;
        this.router.navigateByUrl('/admin/sensors');
      });
  }

  fieldInvalid(name: string) {
    const c = this.form.get(name);
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  deviceLabel(d: DeviceLite) {
    const main = d.name?.trim()
      ? d.name
      : d.macAddress
      ? `Device (${d.macAddress})`
      : d._id ?? d.deviceId ?? '';

    const z: any = d.zone;
    const zText =
      !z ? '' : typeof z === 'object' ? (z?.name ? ` • ${z.name}` : '') : '';

    return main + zText;
  }

  zoneLabel() {
    const z = this.selectedZone();
    if (!z) return '-';
    return z.name ? z.name : z._id;
  }
}