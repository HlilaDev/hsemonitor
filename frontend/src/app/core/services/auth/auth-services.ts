import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URLS } from '../../config/api_urls';
import { Observable } from 'rxjs';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UserCompany {
  _id: string;
  name: string;
  industry?: string;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  company?: string | UserCompany | null;
  avatarUrl?: string;
  role: 'agent' | 'manager' | 'admin' | 'superAdmin';
}

@Injectable({ providedIn: 'root' })
export class AuthServices {
  constructor(private http: HttpClient) {}

  login(data: LoginPayload): Observable<{ user: User }> {
    return this.http.post<{ user: User }>(API_URLS.auth.login, data, {
      withCredentials: true,
    });
  }

  me(): Observable<{ user: User }> {
    return this.http.get<{ user: User }>(API_URLS.auth.me, {
      withCredentials: true,
    });
  }

  logout(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(API_URLS.auth.logout, {}, {
      withCredentials: true,
    });
  }
}