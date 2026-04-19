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
  ZoneServices,
  Zone,
  RiskLevel,
  UpdateZonePayload,
} from '../../../../core/services/zones/zone-services';

type EditZoneForm = FormGroup<{
  name: FormControl<string>;
  description: FormControl<string>;
  riskLevel: FormControl<RiskLevel>;
  isActive: FormControl<boolean>;
}>;

@Component({
  selector: 'app-edit-zone',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslateModule],
  templateUrl: './edit-zone.html',
  styleUrl: './edit-zone.scss',
})
export class EditZone {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private zoneService = inject(ZoneServices);

  id = '';
  zone: Zone | null = null;

  loading = true;
  saving = false;

  errorKey = '';
  successKey = '';

  form!: EditZoneForm;

  constructor() {
    this.form = this.fb.nonNullable.group({
      name: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(3)]),
      description: this.fb.nonNullable.control(''),
      riskLevel: this.fb.nonNullable.control<RiskLevel>('medium', [Validators.required]),
      isActive: this.fb.nonNullable.control(true),
    }) as EditZoneForm;

    this.id = this.route.snapshot.paramMap.get('id') || '';
    this.loadZone();
  }

  loadZone() {
    if (!this.id) {
      this.errorKey = 'ZONES.ERROR.NOT_FOUND';
      this.loading = false;
      return;
    }

    this.loading = true;
    this.errorKey = '';
    this.successKey = '';

    this.zoneService.getZoneById(this.id).subscribe({
      next: (res: any) => {
        const zone = res.zone ?? res;
        this.zone = zone;

        // ✅ patch values
        this.form.patchValue({
          name: zone.name ?? '',
          description: zone.description ?? '',
          riskLevel: (zone.riskLevel ?? 'medium') as RiskLevel,
          isActive: !!zone.isActive,
        });

        this.loading = false;
      },
      error: () => {
        this.errorKey = 'ZONES.ERROR.LOAD_ONE';
        this.loading = false;
      },
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.errorKey = '';
    this.successKey = '';

    const payload: UpdateZonePayload = this.form.getRawValue();

    this.zoneService.updateZone(this.id, payload).subscribe({
      next: () => {
        this.saving = false;
        this.successKey = 'ZONES.SUCCESS.UPDATED';
        setTimeout(() => this.router.navigateByUrl('/admin/zones'), 600);
      },
      error: () => {
        this.saving = false;
        this.errorKey = 'ZONES.ERROR.UPDATE';
      },
    });
  }

  // getters
  get name() {
    return this.form.controls.name;
  }
}