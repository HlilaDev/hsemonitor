import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URLS } from '../../config/api_urls';

export type IncidentSourceType = 'camera' | 'sensor' | 'manual';

export type IncidentStatus =
  | 'open'
  | 'reviewed'
  | 'in_progress'
  | 'closed'
  | 'false_positive';

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';

export type IncidentPriority = 'low' | 'normal' | 'high' | 'urgent';

export type IncidentType =
  | 'NO_HELMET'
  | 'NO_VEST'
  | 'GAS_ALERT'
  | 'TEMP_ALERT'
  | 'FIRE_ALERT'
  | 'FALL'
  | 'INJURY'
  | 'WORK_ACCIDENT'
  | 'LEAK'
  | 'MANUAL_REPORT'
  | 'OTHER';

export interface IncidentEvidence {
  imageUrl?: string;
  videoUrl?: string;
}

export interface IncidentImage {
  url: string;
  publicId?: string;
  uploadedAt?: string;
}

export interface IncidentEvent {
  _id: string;

  title: string;
  description?: string;

  type: IncidentType | string;
  sourceType: IncidentSourceType;

  company?: any;
  zone?: any;
  employee?: any;
  reportedBy?: any;

  device?: any;
  reading?: any;

  severity?: IncidentSeverity;
  priority?: IncidentPriority;

  confidenceScore?: number;
  evidence?: IncidentEvidence;
  images?: IncidentImage[];

  status: IncidentStatus;

  reviewedBy?: any;
  reviewedAt?: string;

  resolvedBy?: any;
  resolvedAt?: string;
  resolutionNote?: string;
  falsePositiveReason?: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface IncidentEventListResponse {
  items: IncidentEvent[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface IncidentEventFilters {
  company?: string;
  zone?: string;
  employee?: string;
  reportedBy?: string;
  device?: string;
  sourceType?: IncidentSourceType;
  type?: IncidentType | string;
  status?: IncidentStatus;
  severity?: IncidentSeverity;
  priority?: IncidentPriority;
  minConfidence?: number;
  maxConfidence?: number;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface CreateManualIncidentEventPayload {
  title: string;
  description?: string;
  type?: IncidentType | string;
  zone: string;
  employee?: string;
  severity?: IncidentSeverity;
  priority?: IncidentPriority;
  images?: IncidentImage[];
}

export interface CreateAutomaticIncidentEventPayload {
  title?: string;
  description?: string;
  type: IncidentType | string;
  sourceType: 'camera' | 'sensor';
  zone?: string;
  device?: string;
  reading?: string;
  confidenceScore?: number;
  evidence?: IncidentEvidence;
  severity?: IncidentSeverity;
  priority?: IncidentPriority;
}

export interface UpdateIncidentEventPayload {
  title?: string;
  description?: string;
  type?: IncidentType | string;
  sourceType?: IncidentSourceType;
  zone?: string | null;
  employee?: string | null;
  device?: string | null;
  reading?: string | null;
  severity?: IncidentSeverity;
  priority?: IncidentPriority;
  confidenceScore?: number | null;
  evidence?: IncidentEvidence;
  images?: IncidentImage[];
  status?: IncidentStatus;
  resolutionNote?: string | null;
  falsePositiveReason?: string | null;
}

export interface ResolveIncidentEventPayload {
  status?: 'closed' | 'false_positive';
  resolutionNote?: string;
  falsePositiveReason?: string;
}

@Injectable({
  providedIn: 'root',
})
export class IncidentEventServices {
  constructor(private http: HttpClient) {}

  createIncidentEvent(
    payload: CreateManualIncidentEventPayload
  ): Observable<IncidentEvent> {
    return this.http.post<IncidentEvent>(
      API_URLS.incidentEvents.create,
      payload,
      { withCredentials: true }
    );
  }

  createAutomaticIncidentEvent(
    payload: CreateAutomaticIncidentEventPayload
  ): Observable<IncidentEvent> {
    return this.http.post<IncidentEvent>(
      API_URLS.incidentEvents.createAutomatic,
      payload,
      { withCredentials: true }
    );
  }

  listIncidentEvents(
    filters?: IncidentEventFilters
  ): Observable<IncidentEventListResponse> {
    let params = new HttpParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, String(value));
        }
      });
    }

    return this.http.get<IncidentEventListResponse>(
      API_URLS.incidentEvents.list,
      {
        params,
        withCredentials: true,
      }
    );
  }

  getIncidentEventById(id: string): Observable<IncidentEvent> {
    return this.http.get<IncidentEvent>(
      API_URLS.incidentEvents.byId(id),
      { withCredentials: true }
    );
  }

  updateIncidentEvent(
    id: string,
    payload: UpdateIncidentEventPayload
  ): Observable<IncidentEvent> {
    return this.http.patch<IncidentEvent>(
      API_URLS.incidentEvents.update(id),
      payload,
      { withCredentials: true }
    );
  }

  reviewIncidentEvent(id: string): Observable<IncidentEvent> {
    return this.http.patch<IncidentEvent>(
      API_URLS.incidentEvents.review(id),
      {},
      { withCredentials: true }
    );
  }

  resolveIncidentEvent(
    id: string,
    payload: ResolveIncidentEventPayload
  ): Observable<IncidentEvent> {
    return this.http.patch<IncidentEvent>(
      API_URLS.incidentEvents.resolve(id),
      payload,
      { withCredentials: true }
    );
  }

  deleteIncidentEvent(id: string): Observable<{
    message: string;
    deletedId?: string;
  }> {
    return this.http.delete<{
      message: string;
      deletedId?: string;
    }>(API_URLS.incidentEvents.delete(id), {
      withCredentials: true,
    });
  }
}