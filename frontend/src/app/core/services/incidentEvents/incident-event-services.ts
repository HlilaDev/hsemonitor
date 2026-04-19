import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URLS } from '../../config/api_urls';

export type IncidentSourceType = 'camera' | 'sensor';
export type IncidentStatus = 'open' | 'reviewed' | 'closed' | 'false_positive';

export interface IncidentEvidence {
  imageUrl?: string;
  videoUrl?: string;
}

export interface IncidentEvent {
  _id: string;
  type: string;
  sourceType: IncidentSourceType;
  device?: any;
  reading?: any;
  zone?: any;
  confidenceScore?: number;
  evidence?: IncidentEvidence;
  status: IncidentStatus;
  resolvedBy?: any;
  resolvedAt?: string;
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
  zone?: string;
  device?: string;
  sourceType?: IncidentSourceType;
  type?: string;
  status?: IncidentStatus;
  minConfidence?: number;
  maxConfidence?: number;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface CreateIncidentEventPayload {
  type: string;
  sourceType: IncidentSourceType;
  device?: string;
  reading?: string;
  zone?: string;
  confidenceScore?: number;
  evidence?: IncidentEvidence;
  status?: IncidentStatus;
  resolvedBy?: string;
  resolvedAt?: string;
}

export interface UpdateIncidentEventPayload {
  type?: string;
  sourceType?: IncidentSourceType;
  device?: string | null;
  reading?: string | null;
  zone?: string | null;
  confidenceScore?: number | null;
  evidence?: IncidentEvidence;
  status?: IncidentStatus;
  resolvedBy?: string | null;
  resolvedAt?: string | null;
}

export interface ResolveIncidentEventPayload {
  resolvedBy: string;
  status?: 'reviewed' | 'closed' | 'false_positive';
}

@Injectable({
  providedIn: 'root',
})
export class IncidentEventServices {
  constructor(private http: HttpClient) {}

  createIncidentEvent(payload: CreateIncidentEventPayload): Observable<IncidentEvent> {
    return this.http.post<IncidentEvent>(API_URLS.incidentEvents.create, payload);
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

    return this.http.get<IncidentEventListResponse>(API_URLS.incidentEvents.list, {
      params,
    });
  }

  getIncidentEventById(id: string): Observable<IncidentEvent> {
    return this.http.get<IncidentEvent>(API_URLS.incidentEvents.byId(id));
  }

  updateIncidentEvent(
    id: string,
    payload: UpdateIncidentEventPayload
  ): Observable<IncidentEvent> {
    return this.http.patch<IncidentEvent>(API_URLS.incidentEvents.update(id), payload);
  }

  resolveIncidentEvent(
    id: string,
    payload: ResolveIncidentEventPayload
  ): Observable<IncidentEvent> {
    return this.http.patch<IncidentEvent>(API_URLS.incidentEvents.resolve(id), payload);
  }

  deleteIncidentEvent(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(API_URLS.incidentEvents.delete(id));
  }
}