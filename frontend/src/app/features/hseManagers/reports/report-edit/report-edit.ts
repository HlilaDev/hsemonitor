import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ReportServices } from '../../../../core/services/reports/report-services';
import { ZoneServices } from '../../../../core/services/zones/zone-services';

@Component({
  selector: 'app-report-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './report-edit.html',
  styleUrl: './report-edit.scss',
})
export class ReportEdit implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private reportServices = inject(ReportServices);
  private zoneServices = inject(ZoneServices);

  loading = signal(true);
  saving = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  reportId = '';
  report = signal<any | null>(null);
  zones = signal<any[]>([]);

  form = this.fb.group({
    title: [''],
    type: ['weekly', Validators.required],
    startDate: [''],
    endDate: [''],
    zone: [''],
    isAutomatic: [true],
  });

  readonly typeOptions = [
    { value: 'weekly', label: 'Hebdomadaire' },
    { value: 'monthly', label: 'Mensuel' },
    { value: 'yearly', label: 'Annuel' },
    { value: 'audit', label: 'Audit' },
    { value: 'custom', label: 'Personnalisé' },
  ];

  ngOnInit(): void {
    this.reportId = this.route.snapshot.paramMap.get('id') || '';

    if (!this.reportId) {
      this.error.set('Identifiant du rapport introuvable.');
      this.loading.set(false);
      return;
    }

    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      report: this.reportServices.getReportById(this.reportId),
      zones: this.zoneServices.getAllZones(),
    }).subscribe({
      next: ({ report, zones }) => {
        this.report.set(report);
        this.zones.set(Array.isArray(zones) ? zones : []);
        this.patchForm(report);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement report edit:', err);
        this.error.set(
          err?.error?.message || 'Impossible de charger le rapport.'
        );
        this.loading.set(false);
      },
    });
  }

  patchForm(report: any): void {
    this.form.patchValue({
      title: report?.title || '',
      type: report?.type || 'weekly',
      startDate: this.toInputDate(report?.startDate),
      endDate: this.toInputDate(report?.endDate),
      zone: this.extractId(report?.zone),
      isAutomatic: !!report?.isAutomatic,
    });
  }

  submit(): void {
    if (this.form.invalid || !this.reportId) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();

    if (
      formValue.startDate &&
      formValue.endDate &&
      new Date(formValue.startDate) > new Date(formValue.endDate)
    ) {
      this.error.set('La date de début doit être antérieure à la date de fin.');
      return;
    }

    this.saving.set(true);
    this.error.set(null);
    this.success.set(null);

    const payload = {
      title: (formValue.title || '').trim(),
      type: formValue.type,
      startDate: formValue.startDate || null,
      endDate: formValue.endDate || null,
      zone: formValue.zone || null,
      isAutomatic: !!formValue.isAutomatic,
    };

    this.reportServices.updateReport(this.reportId, payload).subscribe({
      next: (updated) => {
        this.report.set(updated);
        this.success.set('Rapport mis à jour avec succès.');
        this.saving.set(false);

        setTimeout(() => {
          this.router.navigate(['/manager/reports', this.reportId]);
        }, 700);
      },
      error: (err) => {
        console.error('Erreur update report:', err);
        this.error.set(
          err?.error?.message || 'La mise à jour du rapport a échoué.'
        );
        this.saving.set(false);
      },
    });
  }

  resetForm(): void {
    const current = this.report();
    if (!current) return;

    this.error.set(null);
    this.success.set(null);
    this.patchForm(current);
  }

  goBack(): void {
    if (this.reportId) {
      this.router.navigate(['/manager/reports', this.reportId]);
      return;
    }

    this.router.navigate(['/manager/reports']);
  }

  extractId(value: any): string {
    if (!value) return '';
    if (typeof value === 'string') return value;
    return value._id || '';
  }

  zoneName(zone: any): string {
    if (!zone) return '—';
    if (typeof zone === 'string') return zone;
    return zone.name || '—';
  }

  userName(user: any): string {
    if (!user) return '—';
    if (typeof user === 'string') return user;

    if (user.firstName || user.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }

    return user.name || user.email || user.username || '—';
  }

  typeLabel(type?: string | null): string {
    switch (type) {
      case 'weekly':
        return 'Hebdomadaire';
      case 'monthly':
        return 'Mensuel';
      case 'yearly':
        return 'Annuel';
      case 'audit':
        return 'Audit';
      case 'custom':
        return 'Personnalisé';
      default:
        return 'Rapport';
    }
  }

  badgeClass(type?: string | null): string {
    switch (type) {
      case 'weekly':
        return 'weekly';
      case 'monthly':
        return 'monthly';
      case 'yearly':
        return 'yearly';
      case 'audit':
        return 'audit';
      case 'custom':
        return 'custom';
      default:
        return 'default';
    }
  }

  toInputDate(value: string | Date | null | undefined): string {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';

    const year = d.getFullYear();
    const month = `${d.getMonth() + 1}`.padStart(2, '0');
    const day = `${d.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  fieldInvalid(fieldName: string): boolean {
    const control = this.form.get(fieldName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  metrics = computed(() => {
    const r = this.report();
    return {
      totalIncidents: r?.metrics?.totalIncidents ?? 0,
      totalObservations: r?.metrics?.totalObservations ?? 0,
      complianceRate: r?.metrics?.complianceRate ?? 0,
    };
  });
}