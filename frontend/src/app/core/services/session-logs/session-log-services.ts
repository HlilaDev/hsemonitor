import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URLS } from '../../config/api_urls';
import { Observable } from 'rxjs';

export type SessionStatus = 'success' | 'failed' | 'expired';
export type DeviceType = 'desktop' | 'mobile' | 'tablet';

export interface SessionLogItem {
  _id: string;
  deviceName: string;
  browser: string;
  ipAddress: string;
  location: string;
  status: SessionStatus;
  deviceType: DeviceType;
  loginAt: string;
  lastActivity: string;
  reason?: string;
  current?: boolean; 
}

@Injectable({ providedIn: 'root' })
export class SessionLogServices {
  private http = inject(HttpClient);

  getLogs(): Observable<{ logs: SessionLogItem[] }> {
    return this.http.get<{ logs: SessionLogItem[] }>(API_URLS.sessionLogs.list, {
      withCredentials: true,
    });
  }
}