import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URLS, BASE_URL } from '../../../config/api_urls';

export type AiRiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type AiReportStatus = 'draft' | 'generated' | 'failed';

export interface AiWeeklyReportStats {
  incidentsCount: number;
  observationsCount: number;
  alertsCount: number;
  criticalAlertsCount: number;
  highRiskZonesCount?: number;
  incidentsBySeverity?: Record<string, number>;
  observationsBySeverity?: Record<string, number>;
  alertsBySeverity?: Record<string, number>;
  incidentsByStatus?: Record<string, number>;
  observationsByStatus?: Record<string, number>;
  alertsByStatus?: Record<string, number>;
}

export interface AiWeeklyReportSections {
  incidents?: string;
  observations?: string;
  alerts?: string;
  zones?: string;
  trends?: string;
  causes?: string;
}

export interface AiWeeklyReportRecommendation {
  priority: AiRiskLevel;
  title: string;
  description: string;
  targetZone?: string | null;
}

export interface AiWeeklyReportAction {
  action: string;
  priority: AiRiskLevel;
  responsibleRole: 'manager' | 'supervisor' | 'agent';
  status: 'pending' | 'in_progress' | 'done';
  dueDate?: string | null;
}

export interface AiWeeklyReport {
  _id: string;
  title: string;
  summary: string;
  riskLevel: AiRiskLevel;
  weekStart: string;
  weekEnd: string;
  status: AiReportStatus;
  stats: AiWeeklyReportStats;
  sections: AiWeeklyReportSections;
  recommendations: AiWeeklyReportRecommendation[];
  actionPlan: AiWeeklyReportAction[];
  exportUrl?: string;
  aiProvider?: string;
  aiModel?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AiWeeklyReportResponse {
  success: boolean;
  message: string;
  report: AiWeeklyReport;
}

export interface AiWeeklyReportsListResponse {
  success: boolean;
  count: number;
  reports: AiWeeklyReport[];
}

export interface AiWeeklyReportDeleteResponse {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class AiWeeklyReportService {
  constructor(private http: HttpClient) {}

  generate(regenerate = false): Observable<AiWeeklyReportResponse> {
    return this.http.post<AiWeeklyReportResponse>(
      API_URLS.aiWeeklyReports.generate,
      { regenerate },
      { withCredentials: true }
    );
  }

  getAll(): Observable<AiWeeklyReportsListResponse> {
    return this.http.get<AiWeeklyReportsListResponse>(
      API_URLS.aiWeeklyReports.list,
      { withCredentials: true }
    );
  }

  getById(id: string): Observable<AiWeeklyReportResponse> {
    return this.http.get<AiWeeklyReportResponse>(
      API_URLS.aiWeeklyReports.details(id),
      { withCredentials: true }
    );
  }

  delete(id: string): Observable<AiWeeklyReportDeleteResponse> {
    return this.http.delete<AiWeeklyReportDeleteResponse>(
      API_URLS.aiWeeklyReports.delete(id),
      { withCredentials: true }
    );
  }

  getPdfUrl(report: AiWeeklyReport | null | undefined): string {
    const url = report?.exportUrl;

    if (!url) return '';

    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    const base = BASE_URL.replace(/\/+$/, '');
    const path = url.replace(/^\/+/, '');

    return `${base}/${path}`;
  }
}