import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReportServices } from '../../../../core/services/reports/report-services';
import { BASE_URL } from '../../../../core/config/api_urls';

@Component({
  selector: 'app-report-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, DecimalPipe],
  templateUrl: './report-detail.html',
  styleUrl: './report-detail.scss',
})
export class ReportDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private reportServices = inject(ReportServices);

  loading = signal(true);
  recalculating = signal(false);
  error = signal<string | null>(null);
  report = signal<any | null>(null);

  reportId = '';

  ngOnInit(): void {
    this.reportId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.reportId) {
      this.error.set('Identifiant du rapport introuvable.');
      this.loading.set(false);
      return;
    }

    this.loadReport();
  }

  loadReport(): void {
    this.loading.set(true);
    this.error.set(null);

    this.reportServices.getReportById(this.reportId).subscribe({
      next: (data) => {
        this.report.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement rapport:', err);
        this.error.set(err?.error?.message || 'Impossible de charger le rapport.');
        this.loading.set(false);
      },
    });
  }

  recalcMetrics(): void {
    const current = this.report();
    if (!current?._id) return;

    this.recalculating.set(true);

    this.reportServices.updateReportMetrics(current._id, {}).subscribe({
      next: (updated) => {
        this.report.set(updated);
        this.recalculating.set(false);
      },
      error: (err) => {
        console.error('Erreur recalcul métriques:', err);
        this.error.set(
          err?.error?.message || 'Le recalcul des métriques a échoué.'
        );
        this.recalculating.set(false);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/manager/reports']);
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

  formatPeriod(startDate?: string | Date, endDate?: string | Date): string {
    if (!startDate && !endDate) return 'Période non définie';

    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    const format = (d: Date | null) =>
      d
        ? d.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        : '—';

    return `${format(start)} → ${format(end)}`;
  }

getExportUrl(url?: string | null): string {
  if (!url) return '';

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  const base = BASE_URL.replace(/\/+$/, '');
  const path = url.replace(/^\/+/, '');

  return `${base}/${path}`;
}

  openPdf(): void {
    const url = this.getExportUrl(this.report()?.exportUrl);
    if (!url) return;
    window.open(url, '_blank', 'noopener');
  }

  complianceValue = computed(() => {
    return this.report()?.metrics?.complianceRate ?? 0;
  });

  incidentsValue = computed(() => {
    return this.report()?.metrics?.totalIncidents ?? 0;
  });

  observationsValue = computed(() => {
    return this.report()?.metrics?.totalObservations ?? 0;
  });
}