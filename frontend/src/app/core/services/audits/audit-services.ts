import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URLS } from '../../config/api_urls';

export type AuditType =
  | 'internal'
  | 'external'
  | 'safety'
  | 'environment'
  | 'compliance';

export type AuditStatus =
  | 'planned'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type FindingSeverity = 'low' | 'medium' | 'high' | 'critical';

export type FindingStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export type ZoneRef = string | { _id: string; name?: string };

export type CompanyRef =
  | string
  | {
      _id: string;
      name?: string;
      industry?: string;
    };

export type UserRef =
  | string
  | {
      _id: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      company?: CompanyRef;
    };

export interface Finding {
  _id?: string;
  title: string;
  description?: string;
  severity?: FindingSeverity;
  status?: FindingStatus;
  dueDate?: string | Date;
  assignedTo?: string;
}

export interface Audit {
  _id?: string;
  title: string;
  description?: string;
  type?: AuditType;
  status?: AuditStatus;
  zone?: ZoneRef;
  auditor?: UserRef;
  scheduledDate?: string | Date;
  completedDate?: string | Date;
  score?: number;
  findings?: Finding[];
  attachments?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAuditDto {
  title: string;
  description?: string;
  type?: AuditType;
  status?: AuditStatus;
  zone?: string;
  auditor?: string;
  scheduledDate?: string;
  completedDate?: string;
  score?: number;
  findings?: Finding[];
  attachments?: string[];
}

export interface UpdateAuditDto {
  title?: string;
  description?: string;
  type?: AuditType;
  status?: AuditStatus;
  zone?: string;
  auditor?: string;
  scheduledDate?: string;
  completedDate?: string;
  score?: number;
  findings?: Finding[];
  attachments?: string[];
}

export interface AddFindingDto {
  title: string;
  description?: string;
  severity?: FindingSeverity;
  status?: FindingStatus;
  dueDate?: string;
  assignedTo?: string;
}

export interface UpdateFindingDto {
  title?: string;
  description?: string;
  severity?: FindingSeverity;
  status?: FindingStatus;
  dueDate?: string;
  assignedTo?: string;
}

export interface AuditListResponse {
  items: Audit[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface AuditQueryParams {
  type?: string;
  status?: string;
  zone?: string;
  auditor?: string;
  from?: string;
  to?: string;
  q?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuditServices {
  private http = inject(HttpClient);

  getAllAudits(params?: AuditQueryParams): Observable<AuditListResponse> {
    let httpParams = new HttpParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }

    return this.http.get<AuditListResponse>(API_URLS.audits.allAudits, {
      params: httpParams,
    });
  }

  getAuditById(id: string): Observable<Audit> {
    return this.http.get<Audit>(`${API_URLS.audits.getAuditById}${id}`);
  }

  addAudit(data: CreateAuditDto): Observable<Audit> {
    return this.http.post<Audit>(API_URLS.audits.addAudit, data);
  }

  editAudit(id: string, data: UpdateAuditDto): Observable<Audit> {
    return this.http.put<Audit>(`${API_URLS.audits.editAudit}${id}`, data);
  }

  deleteAudit(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${API_URLS.audits.deleteAudit}${id}`
    );
  }

  addFinding(auditId: string, data: AddFindingDto): Observable<Audit> {
    return this.http.post<Audit>(
      `${API_URLS.audits.addFinding}${auditId}/findings`,
      data
    );
  }

  updateFinding(
    auditId: string,
    findingId: string,
    data: UpdateFindingDto
  ): Observable<Audit> {
    return this.http.put<Audit>(
      `${API_URLS.audits.updateFinding}${auditId}/findings/${findingId}`,
      data
    );
  }

  deleteFinding(
    auditId: string,
    findingId: string
  ): Observable<Audit> {
    return this.http.delete<Audit>(
      `${API_URLS.audits.deleteFinding}${auditId}/findings/${findingId}`
    );
  }

  getZoneName(zone: ZoneRef | undefined): string {
    if (!zone) return '-';
    return typeof zone === 'string' ? zone : zone.name || zone._id;
  }

  getAuditorName(auditor: UserRef | undefined): string {
    if (!auditor) return '-';
    if (typeof auditor === 'string') return auditor;

    const firstName = auditor.firstName || '';
    const lastName = auditor.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim();

    return fullName || auditor.email || auditor._id;
  }
}