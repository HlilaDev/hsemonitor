import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { API_URLS } from '../../config/api_urls';

export interface NotificationItem {
  _id: string; // id de UserNotification
  notificationId?: string; // id de Notification globale

  title: string;
  message: string;
  type?: string;
  action?: string;
  severity?: 'info' | 'success' | 'warning' | 'critical';

  isRead: boolean;
  isDeleted?: boolean;

  createdAt?: string;
  updatedAt?: string;
  readAt?: string | null;
  deletedAt?: string | null;

  zone?: string | { _id: string; name?: string };
  device?:
    | string
    | { _id: string; name?: string; deviceId?: string; status?: string };
  rule?:
    | string
    | {
        _id: string;
        name?: string;
        metric?: string;
        operator?: string;
        threshold?: number;
        severity?: string;
      };

  alert?: string | { _id: string; title?: string };
  report?: string | { _id: string; title?: string; status?: string };
  observation?: string | { _id: string; title?: string; status?: string };
  incident?: string | { _id: string; title?: string; status?: string };
  audit?: string | { _id: string; title?: string; status?: string };
  training?: string | { _id: string; title?: string; status?: string };

  actor?:
    | string
    | {
        _id: string;
        fullName?: string;
        firstName?: string;
        lastName?: string;
        email?: string;
      };

  meta?: any;
}

interface UserNotificationApiItem {
  _id: string;
  isRead: boolean;
  isDeleted?: boolean;
  readAt?: string | null;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  notification: {
    _id: string;
    title: string;
    message: string;
    type?: string;
    action?: string;
    severity?: 'info' | 'success' | 'warning' | 'critical';
    createdAt?: string;
    updatedAt?: string;

    zone?: string | { _id: string; name?: string };
    device?:
      | string
      | { _id: string; name?: string; deviceId?: string; status?: string };
    rule?:
      | string
      | {
          _id: string;
          name?: string;
          metric?: string;
          operator?: string;
          threshold?: number;
          severity?: string;
        };

    alert?: string | { _id: string; title?: string };
    report?: string | { _id: string; title?: string; status?: string };
    observation?: string | { _id: string; title?: string; status?: string };
    incident?: string | { _id: string; title?: string; status?: string };
    audit?: string | { _id: string; title?: string; status?: string };
    training?: string | { _id: string; title?: string; status?: string };

    actor?:
      | string
      | {
          _id: string;
          fullName?: string;
          firstName?: string;
          lastName?: string;
          email?: string;
        };

    meta?: any;
  };
}

@Injectable({
  providedIn: 'root',
})
export class NotificationServices {
  private http = inject(HttpClient);

  private mapUserNotification(item: UserNotificationApiItem): NotificationItem {
    const n = item.notification;

    return {
      _id: item._id,
      notificationId: n?._id,
      title: n?.title || 'Notification',
      message: n?.message || '',
      type: n?.type,
      action: n?.action,
      severity: n?.severity || 'info',
      isRead: item.isRead,
      isDeleted: item.isDeleted,
      createdAt: item.createdAt || n?.createdAt,
      updatedAt: item.updatedAt || n?.updatedAt,
      readAt: item.readAt || null,
      deletedAt: item.deletedAt || null,
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

  getAll(): Observable<NotificationItem[]> {
    return this.http
      .get<UserNotificationApiItem[]>(API_URLS.userNotifications.all)
      .pipe(map((items) => items.map((item) => this.mapUserNotification(item))));
  }

  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(
      API_URLS.userNotifications.unreadCount
    );
  }

  markAsRead(id: string): Observable<NotificationItem> {
    return this.http
      .patch<UserNotificationApiItem>(
        `${API_URLS.userNotifications.markAsRead}${id}/read`,
        {}
      )
      .pipe(map((item) => this.mapUserNotification(item)));
  }

  markAllAsRead(): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(
      API_URLS.userNotifications.markAllAsRead,
      {}
    );
  }

  deleteOne(id: string): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(
      `${API_URLS.userNotifications.delete}${id}/delete`,
      {}
    );
  }
}
