import { Injectable, computed, inject, signal } from '@angular/core';
import { NotificationServices, NotificationItem } from './notification-services';
import {
  SocketServices,
  SocketNotificationPayload,
} from '../socket/socket-services';

@Injectable({
  providedIn: 'root',
})
export class NotificationStore {
  private notificationServices = inject(NotificationServices);
  private socketServices = inject(SocketServices);

  private audio = new Audio('assets/sounds/notification.mp3');

  notifications = signal<NotificationItem[]>([]);
  loading = signal(false);
  initialized = false;

  unreadCount = computed(() =>
    this.notifications().filter((item) => !item.isRead).length
  );

  latestNotifications = computed(() => this.notifications().slice(0, 5));

  init(): void {
    if (this.initialized) return;
    this.initialized = true;

    this.loadNotifications();
    this.listenToSocketNotifications();
    this.socketServices.connect();
  }

  private playNotificationSound(): void {
    this.audio.currentTime = 0;
    this.audio.play().catch((err) => {
      console.warn('Notification sound blocked by browser:', err);
    });
  }

  loadNotifications(): void {
    this.loading.set(true);

    this.notificationServices.getAll().subscribe({
      next: (data) => {
        this.notifications.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load notifications', err);
        this.loading.set(false);
      },
    });
  }

  private mapSocketItem(payload: SocketNotificationPayload): NotificationItem {
    const n = payload.notification;

    return {
      _id: payload._id || crypto.randomUUID(),
      notificationId: n?._id,
      title: n?.title || 'Notification',
      message: n?.message || '',
      type: n?.type,
      action: n?.action,
      severity: n?.severity || 'info',
      isRead: payload.isRead ?? false,
      createdAt: payload.createdAt || n?.createdAt,
      updatedAt: payload.updatedAt || n?.updatedAt,
      zone: n?.zone,
      device: n?.device,
      rule: n?.rule,
      alert: n?.alert,
      report: n?.report,
      observation: n?.observation,
      incident: n?.incident,
      audit: n?.audit,
      training: n?.training,
      actor: n?.actor,
      meta: n?.meta,
    };
  }

  listenToSocketNotifications(): void {
    this.socketServices.onNewNotification().subscribe({
      next: (payload: SocketNotificationPayload) => {
        const newNotification = this.mapSocketItem(payload);

        this.notifications.update((items) => {
          const exists = items.some(
            (item) =>
              item._id === newNotification._id ||
              (!!item.notificationId &&
                item.notificationId === newNotification.notificationId)
          );

          if (exists) return items;

          this.playNotificationSound();
          return [newNotification, ...items];
        });
      },
      error: (err: any) => {
        console.error('Socket notification error', err);
      },
    });
  }

  markAsRead(id: string): void {
    this.notificationServices.markAsRead(id).subscribe({
      next: (updated) => {
        this.notifications.update((items) =>
          items.map((item) => (item._id === id ? updated : item))
        );
      },
      error: (err) => {
        console.error('Failed to mark notification as read', err);
      },
    });
  }

  markAllAsRead(): void {
    this.notificationServices.markAllAsRead().subscribe({
      next: () => {
        this.notifications.update((items) =>
          items.map((item) => ({
            ...item,
            isRead: true,
            readAt: new Date().toISOString(),
          }))
        );
      },
      error: (err) => {
        console.error('Failed to mark all notifications as read', err);
      },
    });
  }

  deleteOne(id: string): void {
    this.notificationServices.deleteOne(id).subscribe({
      next: () => {
        this.notifications.update((items) =>
          items.filter((item) => item._id !== id)
        );
      },
      error: (err) => {
        console.error('Failed to delete notification', err);
      },
    });
  }

  getZoneName(zone: NotificationItem['zone']): string {
    if (!zone) return '-';
    return typeof zone === 'string' ? zone : zone.name || zone._id;
  }

  getDeviceName(device: NotificationItem['device']): string {
    if (!device) return '-';
    if (typeof device === 'string') return device;
    return device.name || device.deviceId || device._id;
  }

  getActorName(actor: NotificationItem['actor']): string {
    if (!actor) return '-';
    if (typeof actor === 'string') return actor;

    const fullName =
      actor.fullName ||
      `${actor.firstName || ''} ${actor.lastName || ''}`.trim();

    return fullName || actor.email || actor._id;
  }

  getSeverityClass(severity?: NotificationItem['severity']): string {
    switch (severity) {
      case 'critical':
        return 'critical';
      case 'warning':
        return 'warning';
      case 'success':
        return 'success';
      default:
        return 'info';
    }
  }

  getTime(value?: string): string {
    if (!value) return '';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    return date.toLocaleString('fr-FR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  }
}