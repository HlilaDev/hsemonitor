import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { of, switchMap } from 'rxjs';

import {
  ObservationService,
  ObservationSeverity,
  ObservationStatus,
} from '../../../../core/services/observations/observation-services';

import { AuthServices, User } from '../../../../core/services/auth/auth-services';
import { ZoneServices } from '../../../../core/services/zones/zone-services';
import { UploadServices } from '../../../../core/services/uploads/upload-services';

type ZoneLite = { _id?: string; id?: string; name: string };

@Component({
  selector: 'app-add-observation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './add-observation.html',
  styleUrl: './add-observation.scss',
})
export class AddObservation {
  private fb = inject(FormBuilder);
  private obsService = inject(ObservationService);
  private auth = inject(AuthServices);
  private zonesService = inject(ZoneServices);
  private upload = inject(UploadServices);
  private router = inject(Router);

  loading = signal(false);
  errorMsg = signal<string | null>(null);
  successMsg = signal<string | null>(null);

  zones = signal<ZoneLite[]>([]);
  me = signal<User | null>(null);

  selectedFiles = signal<File[]>([]);
  formValid = signal(false);

  readonly severityOptions: ObservationSeverity[] = ['low', 'medium', 'high', 'critical'];
  readonly statusOptions: ObservationStatus[] = ['open', 'in_progress', 'closed'];

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(5)]],
    severity: this.fb.nonNullable.control<ObservationSeverity>('medium', Validators.required),
    status: this.fb.nonNullable.control<ObservationStatus>('open', Validators.required),
    zone: this.fb.nonNullable.control<string>('', Validators.required),
  });

  canSubmit = computed(() => this.formValid() && !this.loading());

  constructor() {
    this.loadZones();
    this.loadMe();

    this.form.statusChanges.subscribe(() => {
      this.formValid.set(this.form.valid);
    });
  }

  private getZoneId(z: ZoneLite): string {
    return (z._id || z.id || '') as string;
  }

  private loadZones() {
    this.zonesService.getAllZones().subscribe({
      next: (res: any) => {
        const zones = (res?.zones ?? res?.items ?? []) as any[];
        this.zones.set(zones);

        if (zones.length > 0) {
          const firstZoneId = this.getZoneId(zones[0]);
          Promise.resolve().then(() => {
            this.form.controls.zone.setValue(firstZoneId);
            this.form.controls.zone.markAsDirty();
            this.form.controls.zone.markAsTouched();
            this.form.controls.zone.updateValueAndValidity();
            this.form.updateValueAndValidity();
            this.formValid.set(this.form.valid);
          });
        }
      },
      error: () => {
        this.errorMsg.set("Impossible de charger les zones.");
      }
    });
  }

  private loadMe() {
    this.auth.me().subscribe({
      next: (res) => this.me.set(res.user),
      error: () => this.errorMsg.set('Session expirée. Merci de te reconnecter.'),
    });
  }

  onFilesSelected(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    this.selectedFiles.set(files);
  }

  onZoneChange(ev: Event) {
    const val = (ev.target as HTMLSelectElement).value;
    this.form.controls.zone.setValue(val);
    this.form.controls.zone.updateValueAndValidity();
    this.form.updateValueAndValidity();
    this.formValid.set(this.form.valid);
  }

  submit() {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    const user = this.me();
    if (!user?._id) {
      this.errorMsg.set("Utilisateur non authentifié (reportedBy introuvable).");
      return;
    }

    this.loading.set(true);
    this.errorMsg.set(null);
    this.successMsg.set(null);

    const files = this.selectedFiles();
    const upload$ = files.length ? this.upload.uploadImages(files) : of({ urls: [] as string[] });

    upload$
      .pipe(
        switchMap(({ urls }) => {
          const dto = {
            title: this.form.value.title!,
            description: this.form.value.description!,
            severity: this.form.value.severity!,
            status: this.form.value.status!,
            zone: this.form.value.zone!,       // now sends _id
            reportedBy: user._id,
            images: urls.map((u) => ({ url: u })),
          };
          return this.obsService.create(dto);
        })
      )
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.successMsg.set('Observation ajoutée avec succès ✅');
          this.router.navigateByUrl('/agent/observations');
        },
        error: (err) => {
          this.loading.set(false);
          this.errorMsg.set(err?.error?.message || "Erreur lors de l'ajout de l'observation.");
        },
      });
  }
}