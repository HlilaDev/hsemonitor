import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationStore } from '../../../core/services/notifications/notification-store';

type NotificationTab =
  | 'all'
  | 'alert'
  | 'report'
  | 'observation'
  | 'incident'
  | 'audit'
  | 'training'
  | 'device'
  | 'system';

@Component({
  selector: 'app-notifications-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notifications-list.html',
  styleUrl: './notifications-list.scss',
})
export class NotificationsList implements OnInit {
  notificationStore = inject(NotificationStore);

  activeTab = signal<NotificationTab>('all');
  statusFilter = signal<'all' | 'read' | 'unread'>('all');
  search = signal('');

  notifications = computed(() => {
    let items = this.notificationStore.notifications();

    if (this.activeTab() !== 'all') {
      items = items.filter((item) => item.type === this.activeTab());
    }

    if (this.statusFilter() === 'read') {
      items = items.filter((item) => item.isRead);
    }

    if (this.statusFilter() === 'unread') {
      items = items.filter((item) => !item.isRead);
    }

    const q = this.search().trim().toLowerCase();
    if (q) {
      items = items.filter((item) => {
        const title = item.title?.toLowerCase() || '';
        const message = item.message?.toLowerCase() || '';
        const type = item.type?.toLowerCase() || '';
        return title.includes(q) || message.includes(q) || type.includes(q);
      });
    }

    return items;
  });

  totalCount = computed(() => this.notificationStore.notifications().length);

  unreadCount = computed(
    () => this.notificationStore.notifications().filter((item) => !item.isRead).length
  );

  tabs = [
    { key: 'all' as NotificationTab, label: 'Toutes' },
    { key: 'alert' as NotificationTab, label: 'Alertes' },
    { key: 'report' as NotificationTab, label: 'Rapports' },
    { key: 'observation' as NotificationTab, label: 'Observations' },
    { key: 'incident' as NotificationTab, label: 'Incidents' },
    { key: 'audit' as NotificationTab, label: 'Audits' },
    { key: 'training' as NotificationTab, label: 'Trainings' },
    { key: 'device' as NotificationTab, label: 'Devices' },
    { key: 'system' as NotificationTab, label: 'Système' },
  ];

  ngOnInit(): void {
    this.notificationStore.loadNotifications();
  }

  setTab(tab: NotificationTab): void {
    this.activeTab.set(tab);
  }

  setStatusFilter(value: 'all' | 'read' | 'unread'): void {
    this.statusFilter.set(value);
  }

  onSearchChange(value: string): void {
    this.search.set(value);
  }

  markAllAsRead(): void {
    this.notificationStore.markAllAsRead();
  }

  markOneAsRead(id: string): void {
    this.notificationStore.markAsRead(id);
  }

  deleteOne(id: string): void {
    this.notificationStore.deleteOne(id);
  }

  clearFilters(): void {
    this.activeTab.set('all');
    this.statusFilter.set('all');
    this.search.set('');
  }

  getTypeLabel(type?: string): string {
    switch (type) {
      case 'alert':
        return 'Alerte';
      case 'report':
        return 'Rapport';
      case 'observation':
        return 'Observation';
      case 'incident':
        return 'Incident';
      case 'audit':
        return 'Audit';
      case 'training':
        return 'Training';
      case 'device':
        return 'Device';
      case 'system':
        return 'Système';
      default:
        return 'Notification';
    }
  }

  getTypeIcon(type?: string): string {
    switch (type) {
      case 'alert':
        return 'bi bi-exclamation-triangle';
      case 'report':
        return 'bi bi-file-earmark-text';
      case 'observation':
        return 'bi bi-eye';
      case 'incident':
        return 'bi bi-shield-exclamation';
      case 'audit':
        return 'bi bi-clipboard-check';
      case 'training':
        return 'bi bi-mortarboard';
      case 'device':
        return 'bi bi-cpu';
      case 'system':
        return 'bi bi-gear';
      default:
        return 'bi bi-bell';
    }
  }

  trackById(index: number, item: any): string {
    return item._id;
  }
}