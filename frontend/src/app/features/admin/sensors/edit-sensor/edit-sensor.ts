import {
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { catchError, finalize, of, switchMap } from 'rxjs';

import {
  Sensor,
  SensorServices,
  SensorStatus,
  SensorType,
  UpdateSensorDto,
} from '../../../../core/services/sensors/sensor-services';

@Component({
  selector: 'app-edit-sensor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './edit-sensor.html',
  styleUrl: './edit-sensor.scss',
})
export class EditSensor implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private sensorService = inject(SensorServices);

  loading = signal(false);
  saving = signal(false);
  error = signal<string | null>(null);
  sensor = signal<Sensor | null>(null);

  sensorId = signal('');

  sensorTypes: { value: SensorType | string; label: string }[] = [
    { value: 'temperature', label: 'Température' },
    { value: 'gas', label: 'Gaz' },
    { value: 'humidity', label: 'Humidité' },
    { value: 'noise', label: 'Bruit' },
    { value: 'motion', label: 'Mouvement' },
  ];

  statuses: { value: SensorStatus; label: string }[] = [
    { value: 'online', label: 'Online' },
    { value: 'offline', label: 'Offline' },
    { value: 'maintenance', label: 'Maintenance' },
  ];

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    type: ['temperature', [Validators.required]],
    threshold: [null as number | null],
    unit: [null as string | null],
    status: ['offline' as SensorStatus, [Validators.required]],
  });

  canSubmit = computed(
    () => this.form.valid && !this.loading() && !this.saving()
  );

  ngOnInit(): void {
    const sub = this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id') ?? '';
          this.sensorId.set(id);

          if (!id) {
            this.error.set('ID du capteur manquant.');
            return of(null);
          }

          this.loading.set(true);
          this.error.set(null);

          return this.sensorService.getById(id).pipe(
            catchError((err) => {
              this.error.set(
                err?.error?.message ?? 'Erreur lors du chargement du capteur'
              );
              return of(null);
            }),
            finalize(() => this.loading.set(false))
          );
        })
      )
      .subscribe((sensor) => {
        if (!sensor) return;

        this.sensor.set(sensor);

        this.form.patchValue({
          name: sensor.name ?? '',
          type: sensor.type ?? 'temperature',
          threshold: sensor.threshold ?? null,
          unit: sensor.unit ?? null,
          status: (sensor.status as SensorStatus) ?? 'offline',
        });
      });

    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  submit(): void {
    if (this.form.invalid || !this.sensorId()) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    const v = this.form.getRawValue();

    const dto: UpdateSensorDto = {
      name: v.name?.trim(),
      type: v.type ?? undefined,
      threshold: v.threshold ?? null,
      unit: v.unit?.trim() ? v.unit.trim() : null,
      status: v.status ?? undefined,
    };

    this.sensorService
      .update(this.sensorId(), dto)
      .pipe(
        catchError((err) => {
          this.error.set(err?.error?.message ?? 'Modification échouée');
          return of(null);
        }),
        finalize(() => this.saving.set(false))
      )
      .subscribe((updated) => {
        if (!updated) return;
        this.router.navigateByUrl('/admin/sensors');
      });
  }

  fieldInvalid(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  deviceLabel(): string {
    const s = this.sensor();
    const d: any = s?.deviceId;

    if (!d) return '-';
    if (typeof d === 'object') return d?.name ?? d?.deviceId ?? d?._id ?? '-';
    return String(d);
  }

  zoneLabel(): string {
    const s = this.sensor();
    const z: any = s?.zone;

    if (!z) return '-';
    if (typeof z === 'object') return z?.name ?? z?._id ?? '-';
    return String(z);
  }
}