import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormControl,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import {
  ZoneServices,
  CreateZonePayload,
  RiskLevel,
} from '../../../../core/services/zones/zone-services';

type AddZoneForm = FormGroup<{
  name: FormControl<string>;
  description: FormControl<string>;
  riskLevel: FormControl<RiskLevel>;
  isActive: FormControl<boolean>;
}>;

@Component({
  selector: 'app-add-zone',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './add-zone.html',
  styleUrl: './add-zone.scss',
})
export class AddZone {
  form!: AddZoneForm;

  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private zoneService: ZoneServices,
    private router: Router
  ) {
    // ✅ init form AFTER injection
    this.form = this.fb.nonNullable.group({
      name: this.fb.nonNullable.control('', [
        Validators.required,
        Validators.minLength(3),
      ]),
      description: this.fb.nonNullable.control(''),
      riskLevel: this.fb.nonNullable.control<RiskLevel>('medium', [
        Validators.required,
      ]),
      isActive: this.fb.nonNullable.control(true),
    }) as AddZoneForm;
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // ✅ maintenant getRawValue() retourne exactement CreateZonePayload (sans null)
    const payload: CreateZonePayload = this.form.getRawValue();

    this.zoneService.createZone(payload).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Zone créée avec succès ✅';
        setTimeout(() => this.router.navigateByUrl('/admin/zones'), 600);
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMessage =
          err?.error?.message || 'Erreur lors de la création de la zone';
      },
    });
  }

  get name() {
    return this.form.controls.name;
  }
}