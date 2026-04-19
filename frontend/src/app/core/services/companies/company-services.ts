import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URLS } from '../../config/api_urls';

export interface CompanyAddress {
  country?: string;
  city?: string;
  street?: string;
  postalCode?: string;
}

export interface CompanyContacts {
  email?: string;
  phone?: string;
}

export interface Company {
  _id: string;
  name: string;
  industry?: string;
  logoUrl?: string;
  address?: CompanyAddress;
  contacts?: CompanyContacts;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCompanyDto {
  name: string;
  industry?: string;
  logoUrl?: string;
  address?: CompanyAddress;
  contacts?: CompanyContacts;
  isActive?: boolean;
}

export interface UpdateCompanyDto {
  name?: string;
  industry?: string;
  logoUrl?: string;
  address?: CompanyAddress;
  contacts?: CompanyContacts;
  isActive?: boolean;
}

export interface CompanyListResponse {
  items: Company[];
  total: number;
  page: number;
  pages: number;
}

export interface CompanyListQuery {
  page?: number;
  limit?: number;
  q?: string;
  isActive?: boolean | '';
}

@Injectable({
  providedIn: 'root',
})
export class CompanyServices {
  private http = inject(HttpClient);
  private readonly apiUrl = API_URLS.companies;

  createCompany(payload: CreateCompanyDto): Observable<Company> {
    return this.http.post<Company>(this.apiUrl, payload, {
      withCredentials: true,
    });
  }

  getCompanies(query?: CompanyListQuery): Observable<CompanyListResponse> {
    let params = new HttpParams();

    if (query?.page != null) {
      params = params.set('page', query.page);
    }

    if (query?.limit != null) {
      params = params.set('limit', query.limit);
    }

    if (query?.q) {
      params = params.set('q', query.q);
    }

    if (query?.isActive !== '' && query?.isActive !== undefined) {
      params = params.set('isActive', String(query.isActive));
    }

    return this.http.get<CompanyListResponse>(this.apiUrl, {
      params,
      withCredentials: true,
    });
  }

  getCompanyById(id: string): Observable<Company> {
    return this.http.get<Company>(`${this.apiUrl}/${id}`, {
      withCredentials: true,
    });
  }

  updateCompany(id: string, payload: UpdateCompanyDto): Observable<Company> {
    return this.http.put<Company>(`${this.apiUrl}/${id}`, payload, {
      withCredentials: true,
    });
  }

  deleteCompany(id: string): Observable<{ message: string; zonesCount?: number }> {
    return this.http.delete<{ message: string; zonesCount?: number }>(
      `${this.apiUrl}/${id}`,
      {
        withCredentials: true,
      }
    );
  }
}