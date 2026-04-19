import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { API_URLS } from '../../config/api_urls';

export type ObservationSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ObservationStatus =
  | 'open'
  | 'in_progress'
  | 'pending_validation'
  | 'closed'
  | 'reopened';

export type ObservationScope = 'mine' | 'reported' | 'assigned';

export interface ObservationImage {
  url: string;
  uploadedAt?: string;
}

export interface ObservationZone {
  _id: string;
  name: string;
}

export interface ObservationUser {
  _id: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  role?: string;
}

export interface ObservationCompany {
  _id: string;
  name: string;
}

export interface Observation {
  _id: string;
  title: string;
  description: string;
  severity: ObservationSeverity;
  status: ObservationStatus;
  zone: string | ObservationZone;
  reportedBy: string | ObservationUser;
  company?: string | ObservationCompany;

  assignedTo?: string | ObservationUser | null;
  assignedBy?: string | ObservationUser | null;
  assignedAt?: string | null;

  images: ObservationImage[];

  resolutionComment?: string;
  resolutionImages?: ObservationImage[];
  resolvedAt?: string | null;
  resolvedBy?: string | ObservationUser | null;

  validationComment?: string;
  validatedAt?: string | null;
  validatedBy?: string | ObservationUser | null;

  createdAt: string;
  updatedAt: string;
}

export interface ObservationCreateDto {
  title: string;
  description: string;
  severity: ObservationSeverity;
  status?: ObservationStatus;
  zone: string;
  images?: ObservationImage[];
}

export interface ObservationUpdateDto {
  title?: string;
  description?: string;
  severity?: ObservationSeverity;
  status?: ObservationStatus;
  zone?: string;
}

export interface ObservationAssignDto {
  assignedTo: string;
}

export interface ObservationResolveDto {
  resolutionComment?: string;
  resolutionImages?: ObservationImage[];
}

export interface ObservationValidateDto {
  validationComment?: string;
}

export interface ObservationRejectDto {
  validationComment: string;
}

export interface ObservationListFilters {
  zone?: string;
  status?: string;
  severity?: string;
  q?: string;
  page?: number;
  limit?: number;
  reportedBy?: string;
  assignedTo?: string;
  scope?: ObservationScope;
  sort?: string;
}

export interface ObservationListResponse {
  items: Observation[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

@Injectable({ providedIn: 'root' })
export class ObservationService {
  constructor(private http: HttpClient) {}

  create(dto: ObservationCreateDto): Observable<Observation> {
    return this.http.post<Observation>(API_URLS.observations.create, dto, {
      withCredentials: true,
    });
  }

  list(filters?: ObservationListFilters): Observable<ObservationListResponse> {
    let params = new HttpParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, String(value));
        }
      });
    }

    return this.http.get<ObservationListResponse>(API_URLS.observations.list, {
      params,
      withCredentials: true,
    });
  }

  getById(id: string): Observable<Observation> {
    return this.http.get<Observation>(API_URLS.observations.byId(id), {
      withCredentials: true,
    });
  }

  update(id: string, dto: ObservationUpdateDto): Observable<Observation> {
    return this.http.patch<Observation>(API_URLS.observations.update(id), dto, {
      withCredentials: true,
    });
  }

  assign(id: string, dto: ObservationAssignDto): Observable<Observation> {
    return this.http.patch<Observation>(API_URLS.observations.assign(id), dto, {
      withCredentials: true,
    });
  }

  resolve(id: string, dto: ObservationResolveDto): Observable<Observation> {
    return this.http.patch<Observation>(
      API_URLS.observations.resolve(id),
      dto,
      { withCredentials: true }
    );
  }

  validate(id: string, dto: ObservationValidateDto): Observable<Observation> {
    return this.http.patch<Observation>(
      API_URLS.observations.validate(id),
      dto,
      { withCredentials: true }
    );
  }

  reject(id: string, dto: ObservationRejectDto): Observable<Observation> {
    return this.http.patch<Observation>(
      API_URLS.observations.reject(id),
      dto,
      { withCredentials: true }
    );
  }

  addImage(observationId: string, url: string): Observable<Observation> {
    return this.http.post<Observation>(
      API_URLS.observations.addImage(observationId),
      { url },
      { withCredentials: true }
    );
  }

  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      API_URLS.observations.delete(id),
      { withCredentials: true }
    );
  }

  getObservationsCountByAgent(agentId: string): Observable<number> {
    return this.http
      .get<{ totalCount: number }>(
        API_URLS.observations.totalCountByAgent(agentId),
        { withCredentials: true }
      )
      .pipe(map((response) => response.totalCount));
  }
}