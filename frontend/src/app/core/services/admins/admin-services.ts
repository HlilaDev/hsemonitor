import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URLS } from '../../config/api_urls';

export interface AdminUser {
  _id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  role: string;
  company?: {
    _id: string;
    name: string;
  } | string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminListResponse {
  items: AdminUser[];
  total: number;
  page: number;
  pages: number;
}

@Injectable({
  providedIn: 'root',
})
export class AdminServices {
  private readonly http = inject(HttpClient);

  getAdmins(params?: {
    page?: number;
    limit?: number;
    q?: string;
  }): Observable<AdminListResponse> {
    let httpParams = new HttpParams();

    if (params?.page != null) {
      httpParams = httpParams.set('page', params.page);
    }

    if (params?.limit != null) {
      httpParams = httpParams.set('limit', params.limit);
    }

    if (params?.q?.trim()) {
      httpParams = httpParams.set('q', params.q.trim());
    }

    httpParams = httpParams.set('role', 'admin');

    return this.http.get<AdminListResponse>(API_URLS.users.allusers, {
      params: httpParams,
      withCredentials: true,
    });
  }
}