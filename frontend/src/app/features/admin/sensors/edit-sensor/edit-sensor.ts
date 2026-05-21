import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { catchError, finalize, forkJoin, of, switchMap } from 'rxjs';

import {
  Sensor,
  SensorServices,
  SensorStatus,
  SensorType,
  UpdateSensorDto,
} from '../../../../core/services/sensors/sensor-services';

import {
  AlertRule,
  AlertRuleServices,
  CreateAlertRuleDto,
} from '../../../../core/services/alert-rules/alert-rule-services';

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
  private alertRuleService = inject(AlertRuleServices);

  loading = signal(false);
  saving = signal(false);
  ruleSaving = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  sensor = signal<Sensor | null>(null);
  alertRules = signal<AlertRule[]>([]);
  sensorId = signal('');

  sensorTypes: { value: SensorType | string; label: string; unit: string }[] = [
    { value: 'temperature', label: 'Température', unit: '°C' },
    { value: 'gas', label: 'Gaz', unit: 'ppm' },
    { value: 'humidity', label: 'Humidité', unit: '%' },
    { value: 'noise', label: 'Bruit', unit: 'dB' },
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
    threshold: [null as number | null],
    unit: [null as string | null],
    status: ['offline' as SensorStatus, [Validators.required]],
  });

  ruleForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    operator: ['>=', [Validators.required]],
    threshold: [null as number | null, [Validators.required]],
    severity: ['critical', [Validators.required]],
    cooldownSec: [300, [Validators.required, Validators.min(0)]],
    isActive: [true],
  });

  canSubmit = computed(() => this.form.valid && !this.loading() && !this.saving());
  canCreateRule = computed(() => this.ruleForm.valid && !!this.sensorId() && !this.ruleSaving());

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

          return forkJoin({
            sensor: this.sensorService.getById(id),
            rules: this.alertRuleService.list({ sensor: id }),
          }).pipe(
            catchError((err) => {
              this.error.set(err?.error?.message ?? 'Erreur lors du chargement');
              return of(null);
            }),
            finalize(() => this.loading.set(false))
          );
        })
      )
      .subscribe((result) => {
        if (!result) return;

        this.sensor.set(result.sensor);
        this.alertRules.set(result.rules ?? []);

        this.form.patchValue({
          name: result.sensor.name ?? '',
          type: result.sensor.type ?? 'temperature',
          threshold: result.sensor.threshold ?? null,
          unit: result.sensor.unit ?? this.defaultUnit(result.sensor.type),
          status: (result.sensor.status as SensorStatus) ?? 'offline',
        });

        this.prefillRuleForm(result.sensor);
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
    this.success.set(null);

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
        this.sensor.set(updated);
        this.success.set('Capteur modifié avec succès.');
        this.prefillRuleForm(updated);
      });
  }

  createRule(): void {
    if (this.ruleForm.invalid || !this.sensorId()) {
      this.ruleForm.markAllAsTouched();
      return;
    }

    const sensor = this.sensor();
    const v = this.ruleForm.getRawValue();

    const dto: CreateAlertRuleDto = {
      name: v.name?.trim() || `${sensor?.name ?? 'Sensor'} alert rule`,
      metric: String(this.form.value.type ?? sensor?.type ?? 'temperature'),
      operator: String(v.operator),
      threshold: Number(v.threshold),
      severity: String(v.severity),
      sensor: this.sensorId(),
      device: this.deviceIdForRule(),
      zone: this.zoneIdForRule(),
      isActive: !!v.isActive,
      cooldownSec: Number(v.cooldownSec ?? 300),
    };

    this.ruleSaving.set(true);
    this.error.set(null);
    this.success.set(null);

    this.alertRuleService
      .create(dto)
      .pipe(
        catchError((err) => {
          this.error.set(err?.error?.message ?? 'Création de la règle échouée');
          return of(null);
        }),
        finalize(() => this.ruleSaving.set(false))
      )
      .subscribe((rule) => {
        if (!rule) return;
        this.alertRules.update((rules) => [rule, ...rules]);
        this.success.set('Alert rule ajoutée avec succès.');
      });
  }

  toggleRule(rule: AlertRule): void {
    this.alertRuleService.toggle(rule._id).subscribe((updated) => {
      this.alertRules.update((rules) =>
        rules.map((r) => (r._id === updated._id ? updated : r))
      );
    });
  }

  deleteRule(rule: AlertRule): void {
    if (!confirm('Supprimer cette alert rule ?')) return;

    this.alertRuleService.delete(rule._id).subscribe(() => {
      this.alertRules.update((rules) => rules.filter((r) => r._id !== rule._id));
      this.success.set('Alert rule supprimée.');
    });
  }

  fieldInvalid(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  ruleFieldInvalid(name: string): boolean {
    const c = this.ruleForm.get(name);
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  deviceLabel(): string {
    const d: any = this.sensor()?.device ?? this.sensor()?.deviceId;
    if (!d) return '-';
    if (typeof d === 'object') return d?.name ?? d?.deviceId ?? d?._id ?? '-';
    return String(d);
  }

  zoneLabel(): string {
    const z: any = this.sensor()?.zone;
    if (!z) return '-';
    if (typeof z === 'object') return z?.name ?? z?._id ?? '-';
    return String(z);
  }

  private prefillRuleForm(sensor: Sensor): void {
    const metric = String(sensor.type ?? this.form.value.type ?? 'temperature');

    this.ruleForm.patchValue({
      name: `${sensor.name} - seuil ${metric}`,
      operator: '>=',
      threshold: sensor.threshold ?? null,
      severity: 'critical',
      cooldownSec: 300,
      isActive: true,
    });
  }

  private defaultUnit(type: SensorType | string): string {
    return this.sensorTypes.find((t) => t.value === type)?.unit ?? '';
  }

  private deviceIdForRule(): string | undefined {
    const d: any = this.sensor()?.device;
    if (!d) return undefined;
    return typeof d === 'object' ? d?._id : String(d);
  }

  private zoneIdForRule(): string | undefined {
    const z: any = this.sensor()?.zone;
    if (!z) return undefined;
    return typeof z === 'object' ? z?._id : String(z);
  }

  goBack(): void {
    this.router.navigateByUrl('/admin/sensors');
  }
}