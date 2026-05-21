import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URLS } from '../../config/api_urls';

export interface AlertRule {
  _id: string;
  name: string;
  metric: string;
  operator: '>' | '>=' | '<' | '<=' | '==' | '!=';
  threshold: number;
  severity: 'info' | 'warning' | 'critical';
  sensor?: string;
  device?: string;
  zone?: string;
  isActive: boolean;
  cooldownSec: number;
}

export interface CreateAlertRuleDto {
  name: string;
  metric: string;
  operator: string;
  threshold: number;
  severity: string;
  sensor?: string;
  device?: string;
  zone?: string;
  isActive?: boolean;
  cooldownSec?: number;
}

@Injectable({ providedIn: 'root' })
export class AlertRuleServices {
  private http = inject(HttpClient);

  list(filters?: { sensor?: string; metric?: string }): Observable<AlertRule[]> {
    let params = new HttpParams();
    if (filters?.sensor) params = params.set('sensor', filters.sensor);
    if (filters?.metric) params = params.set('metric', filters.metric);

    return this.http.get<AlertRule[]>(API_URLS.alertRules.list, {
      params,
      withCredentials: true,
    });
  }

  create(dto: CreateAlertRuleDto): Observable<AlertRule> {
    return this.http.post<AlertRule>(API_URLS.alertRules.create, dto, {
      withCredentials: true,
    });
  }

  toggle(id: string): Observable<AlertRule> {
  return this.http.patch<AlertRule>(
    API_URLS.alertRules.toggle(id),
    {},
    { withCredentials: true }
  );
}

delete(id: string): Observable<void> {
  return this.http.delete<void>(
    API_URLS.alertRules.delete(id),
    { withCredentials: true }
  );
}
}