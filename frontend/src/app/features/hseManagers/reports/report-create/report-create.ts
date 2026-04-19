import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';

import { ReportServices } from '../../../../core/services/reports/report-services';
import { ZoneServices } from '../../../../core/services/zones/zone-services';
import { AuthServices } from '../../../../core/services/auth/auth-services';

type ZoneLite = { _id: string; name: string };
type ReportType = 'weekly' | 'monthly' | 'yearly' | 'audit' | 'custom';

@Component({
  selector: 'app-report-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './report-create.html',
  styleUrl: './report-create.scss',
})
export class ReportCreate implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  private reportsApi = inject(ReportServices);
  private zonesApi = inject(ZoneServices);
  private authApi = inject(AuthServices);

  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly pdfError = signal<string | null>(null);
  readonly zones = signal<ZoneLite[]>([]);
  readonly currentUserId = signal<string | null>(null);
  readonly selectedPdf = signal<File | null>(null);
  readonly selectedPdfName = signal<string>('');

  readonly form = this.fb.group({
    title: [''],
    type: ['weekly' as ReportType, Validators.required],
    zone: [''],
    startDate: [''],
    endDate: [''],
    isAutomatic: [true],
    totalIncidents: [0],
    totalObservations: [0],
    complianceRate: [0],
  });

  readonly dateError = computed(() => {
    const s = this.form.value.startDate;
    const e = this.form.value.endDate;
    if (!s || !e) return false;
    return new Date(e).getTime() <= new Date(s).getTime();
  });

  ngOnInit(): void {
    this.loadZones();
    this.loadMe();
  }

  fieldInvalid(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  cancel(): void {
    this.router.navigate(['/manager/reports']);
  }

  onPdfSelected(event: Event): void {
    this.pdfError.set(null);

    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;

    if (!file) {
      this.selectedPdf.set(null);
      this.selectedPdfName.set('');
      return;
    }

    if (file.type !== 'application/pdf') {
      this.selectedPdf.set(null);
      this.selectedPdfName.set('');
      this.pdfError.set('Veuillez sélectionner un fichier PDF valide.');
      input.value = '';
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      this.selectedPdf.set(null);
      this.selectedPdfName.set('');
      this.pdfError.set('Le fichier PDF dépasse 10 MB.');
      input.value = '';
      return;
    }

    this.selectedPdf.set(file);
    this.selectedPdfName.set(file.name);
  }

  private loadMe(): void {
    this.authApi
      .me()
      .pipe(
        catchError((err) => {
          console.error('Erreur me():', err);
          this.error.set("Impossible de récupérer l'utilisateur connecté.");
          return of(null);
        })
      )
      .subscribe((res) => {
        this.currentUserId.set(res?.user?._id || null);
      });
  }

  private loadZones(): void {
    const obs$ = (this.zonesApi as any).allZones
      ? (this.zonesApi as any).allZones()
      : (this.zonesApi as any).getAllZones
      ? (this.zonesApi as any).getAllZones()
      : null;

    if (!obs$) return;

    obs$
      .pipe(catchError(() => of([])))
      .subscribe((zs: any) => {
        const list = Array.isArray(zs) ? zs : zs?.items ?? [];
        this.zones.set(list.map((z: any) => ({ _id: z._id, name: z.name })));
      });
  }

  submit(): void {
    this.error.set(null);
    this.pdfError.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.dateError()) {
      this.error.set('La date de fin doit être strictement supérieure à la date de début.');
      return;
    }

    if (!this.currentUserId()) {
      this.error.set("Utilisateur connecté introuvable. Veuillez vous reconnecter.");
      return;
    }

    const v = this.form.value;
    const formData = new FormData();

    formData.append('type', String(v.type || 'weekly'));

    if (v.title?.trim()) formData.append('title', v.title.trim());
    if (v.startDate) formData.append('startDate', new Date(v.startDate).toISOString());
    if (v.endDate) formData.append('endDate', new Date(v.endDate).toISOString());
    if (v.zone) formData.append('zone', v.zone);
    formData.append('generatedBy', this.currentUserId()!);
    formData.append('isAutomatic', String(!!v.isAutomatic));

    formData.append('metrics[totalIncidents]', String(Number(v.totalIncidents ?? 0)));
    formData.append('metrics[totalObservations]', String(Number(v.totalObservations ?? 0)));
    formData.append('metrics[complianceRate]', String(Number(v.complianceRate ?? 0)));

    const pdf = this.selectedPdf();
    if (pdf) {
      formData.append('pdf', pdf);
    }

    this.loading.set(true);

    this.reportsApi
      .createReport(formData)
      .pipe(
        catchError((err) => {
          console.error('Erreur création report:', err);
          this.error.set(
            err?.error?.message || 'Erreur lors de la création du report.'
          );
          return of(null);
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe((created: any) => {
        if (!created) return;
        this.router.navigate(['/manager/reports']);
      });
  }
}