import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { BASE_URL } from '../../config/api_urls';

export interface LiveAlert {
  action?: string;
  _id?: string;
  notificationId?: string;
  type?: string;
  title?: string;
  message?: string;
  severity?: 'info' | 'success' | 'warning' | 'critical';
  status?: 'open' | 'acknowledged' | 'resolved';
  readingValue?: number;
  threshold?: number;
  createdAt?: string;
  updatedAt?: string;
  isRead?: boolean;
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
  actor?:
    | string
    | {
        _id: string;
        fullName?: string;
        firstName?: string;
        lastName?: string;
        email?: string;
      };
  observation?: string | { _id: string; title?: string; status?: string };
  meta?: any;
}

export interface SocketNotificationPayload {
  _id?: string;
  isRead?: boolean;
  createdAt?: string;
  updatedAt?: string;
  notification?: {
    _id?: string;
    title?: string;
    message?: string;
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
    actor?:
      | string
      | {
          _id: string;
          fullName?: string;
          firstName?: string;
          lastName?: string;
          email?: string;
        };
    observation?: string | { _id: string; title?: string; status?: string };
    alert?: string | { _id: string; title?: string };
    report?: string | { _id: string; title?: string; status?: string };
    incident?: string | { _id: string; title?: string; status?: string };
    audit?: string | { _id: string; title?: string; status?: string };
    training?: string | { _id: string; title?: string; status?: string };
    meta?: any;
  };
}

@Injectable({
  providedIn: 'root',
})
export class SocketServices {
  private socket: Socket | null = null;

  connect(): void {
    if (this.socket?.connected) return;

    this.socket = io(BASE_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });
  }

  onNewAlert(): Observable<LiveAlert> {
    return new Observable<LiveAlert>((observer) => {
      if (!this.socket) {
        this.connect();
      }

      const handler = (data: LiveAlert) => {
        observer.next(data);
      };

      this.socket?.on('alert:new', handler);

      return () => {
        this.socket?.off('alert:new', handler);
      };
    });
  }

  onNewNotification(): Observable<SocketNotificationPayload> {
    return new Observable<SocketNotificationPayload>((observer) => {
      if (!this.socket) {
        this.connect();
      }

      const handler = (data: SocketNotificationPayload) => {
        observer.next(data);
      };

      this.socket?.on('notification:new', handler);

      return () => {
        this.socket?.off('notification:new', handler);
      };
    });
  }

  onDeviceOffline(): Observable<any> {
    return new Observable<any>((observer) => {
      if (!this.socket) {
        this.connect();
      }

      const handler = (data: any) => {
        observer.next(data);
      };

      this.socket?.on('device:offline', handler);

      return () => {
        this.socket?.off('device:offline', handler);
      };
    });
  }

  onDeviceOnline(): Observable<any> {
    return new Observable<any>((observer) => {
      if (!this.socket) {
        this.connect();
      }

      const handler = (data: any) => {
        observer.next(data);
      };

      this.socket?.on('device:online', handler);

      return () => {
        this.socket?.off('device:online', handler);
      };
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  getZoneName(zone: LiveAlert['zone']): string {
    if (!zone) return '-';
    return typeof zone === 'string' ? zone : zone.name || zone._id;
  }

  getDeviceName(device: LiveAlert['device']): string {
    if (!device) return '-';
    if (typeof device === 'string') return device;
    return device.name || device.deviceId || device._id;
  }

  getActorName(actor: LiveAlert['actor']): string {
    if (!actor) return '-';
    if (typeof actor === 'string') return actor;

    const fullName =
      actor.fullName ||
      `${actor.firstName || ''} ${actor.lastName || ''}`.trim();

    return fullName || actor.email || actor._id;
  }
}