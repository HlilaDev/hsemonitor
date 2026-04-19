import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import {
  OperationalMessage,
  OperationalMessageServices,
} from '../../../../core/services/operational-messages/operatioanl-message-services';

@Component({
  selector: 'app-all-operational-messages',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './all-operational-messages.html',
  styleUrl: './all-operational-messages.scss',
})
export class AllOperationalMessages implements OnInit {
  private operationalMessageServices = inject(OperationalMessageServices);
  private router = inject(Router);

  loading = signal(false);
  actionLoadingId = signal<string | null>(null);
  error = signal<string | null>(null);

  items = signal<OperationalMessage[]>([]);

  page = signal(1);
  limit = signal(10);
  total = signal(0);
  totalPages = signal(1);

  search = signal('');
  selectedStatus = signal('');
  selectedTargetType = signal('');

  readonly statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'draft', label: 'Draft' },
    { value: 'queued', label: 'Queued' },
    { value: 'sent', label: 'Sent' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'displayed', label: 'Displayed' },
    { value: 'failed', label: 'Failed' },
    { value: 'expired', label: 'Expired' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  readonly targetTypeOptions = [
    { value: '', label: 'Toutes les cibles' },
    { value: 'device', label: 'Device' },
    { value: 'zone', label: 'Zone' },
    { value: 'broadcast', label: 'Broadcast' },
  ];

  readonly draftCount = computed(
    () => this.items().filter((item) => item.status === 'draft').length
  );

  readonly sentCount = computed(
    () => this.items().filter((item) => item.status === 'sent').length
  );

  readonly displayedCount = computed(
    () => this.items().filter((item) => item.status === 'displayed').length
  );

  readonly criticalCount = computed(
    () => this.items().filter((item) => item.priority === 'critical').length
  );

  ngOnInit(): void {
    this.loadMessages();
  }

  loadMessages(): void {
    this.loading.set(true);
    this.error.set(null);

    this.operationalMessageServices
      .getMessages({
        page: this.page(),
        limit: this.limit(),
        status: this.selectedStatus() || undefined,
        targetType: this.selectedTargetType() || undefined,
        search: this.search().trim() || undefined,
      })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.items.set(response.items || []);
          this.total.set(response.pagination?.total || 0);
          this.totalPages.set(response.pagination?.pages || 1);
        },
        error: (err) => {
          this.error.set(
            err?.error?.message || 'Erreur lors du chargement des messages.'
          );
          this.items.set([]);
        },
      });
  }

  onSearchChange(value: string): void {
    this.search.set(value);
  }

  applyFilters(): void {
    this.page.set(1);
    this.loadMessages();
  }

  resetFilters(): void {
    this.search.set('');
    this.selectedStatus.set('');
    this.selectedTargetType.set('');
    this.page.set(1);
    this.loadMessages();
  }

  onStatusChange(value: string): void {
    this.selectedStatus.set(value);
  }

  onTargetTypeChange(value: string): void {
    this.selectedTargetType.set(value);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.page.set(page);
    this.loadMessages();
  }

  goToDetail(item: OperationalMessage): void {
    if (!item?._id) return;

    this.router.navigate(['/manager/operational-messages', item._id]);
  }

  publishMessage(item: OperationalMessage): void {
    if (!item?._id) return;

    this.actionLoadingId.set(item._id);

    this.operationalMessageServices
      .publishMessage(item._id)
      .pipe(finalize(() => this.actionLoadingId.set(null)))
      .subscribe({
        next: () => {
          this.loadMessages();
        },
        error: (err) => {
          this.error.set(
            err?.error?.message || 'Impossible de publier ce message.'
          );
        },
      });
  }

  cancelMessage(item: OperationalMessage): void {
    if (!item?._id) return;

    this.actionLoadingId.set(item._id);

    this.operationalMessageServices
      .cancelMessage(item._id)
      .pipe(finalize(() => this.actionLoadingId.set(null)))
      .subscribe({
        next: () => {
          this.loadMessages();
        },
        error: (err) => {
          this.error.set(
            err?.error?.message || 'Impossible d’annuler ce message.'
          );
        },
      });
  }

  deleteMessage(item: OperationalMessage): void {
    if (!item?._id) return;

    const confirmed = window.confirm(
      `Supprimer le message "${item.title || item.content}" ?`
    );

    if (!confirmed) return;

    this.actionLoadingId.set(item._id);

    this.operationalMessageServices
      .deleteMessage(item._id)
      .pipe(finalize(() => this.actionLoadingId.set(null)))
      .subscribe({
        next: () => {
          this.loadMessages();
        },
        error: (err) => {
          this.error.set(
            err?.error?.message || 'Impossible de supprimer ce message.'
          );
        },
      });
  }

  getTargetLabel(item: OperationalMessage): string {
    if (item.targetType === 'broadcast') {
      return 'Broadcast';
    }

    if (item.targetType === 'zone') {
      if (item.targetZone && typeof item.targetZone === 'object') {
        return item.targetZone.name || 'Zone';
      }
      return 'Zone';
    }

    if (item.targetType === 'device') {
      if (item.targetDevice && typeof item.targetDevice === 'object') {
        return item.targetDevice.name || item.targetDevice.deviceId || 'Device';
      }
      return 'Device';
    }

    return '-';
  }

  getCreatedByLabel(item: OperationalMessage): string {
    if (item.createdBy && typeof item.createdBy === 'object') {
      return (
        `${item.createdBy.firstName || ''} ${item.createdBy.lastName || ''}`.trim() ||
        item.createdBy.email ||
        '-'
      );
    }

    return '-';
  }

  trackByMessageId(_: number, item: OperationalMessage): string {
    return item._id;
  }


}