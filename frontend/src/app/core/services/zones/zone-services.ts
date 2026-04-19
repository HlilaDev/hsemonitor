import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URLS } from '../../config/api_urls';
import { Device } from '../devices/device-services';

export type RiskLevel = 'low' | 'medium' | 'high';

export interface Zone {
  _id: string;
  name: string;
  description?: string;
  riskLevel: RiskLevel;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  temperature?: number | null;
  humidity?: number | null;
  alertsCount?: number;
  sensors?: any[];
  devices?: any[];
  employees?: any[];
  code?: string;
  employeesCount?: number;
devicesCount?: number;
sensorsCount?: number;
}

export interface CreateZonePayload {
  name: string;
  description?: string;
  riskLevel: RiskLevel;
  isActive: boolean;
}

export interface UpdateZonePayload {
  name?: string;
  description?: string;
  riskLevel?: RiskLevel;
  isActive?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ZoneServices {
  constructor(private http: HttpClient) {}

  getAllZones(
    companyId?: string,
    isActive?: boolean
  ): Observable<{ items: Zone[]; total: number; page: number; pages: number }> {
    let params = new HttpParams();

    if (companyId) {
      params = params.set('company', companyId);
    }

    if (isActive !== undefined) {
      params = params.set('isActive', String(isActive));
    }

    return this.http.get<{ items: Zone[]; total: number; page: number; pages: number }>(
      API_URLS.zones.allZones,
      {
        withCredentials: true,
        params,
      }
    );
  }

  getZoneById(id: string): Observable<Zone> {
    return this.http.get<Zone>(API_URLS.zones.getZoneById + id, {
      withCredentials: true,
    });
  }

  createZone(payload: CreateZonePayload): Observable<Zone> {
    return this.http.post<Zone>(API_URLS.zones.allZones, payload, {
      withCredentials: true,
    });
  }

  updateZone(id: string, payload: UpdateZonePayload): Observable<Zone> {
    return this.http.put<Zone>(API_URLS.zones.editZone + id, payload, {
      withCredentials: true,
    });
  }

  deleteZone(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(API_URLS.zones.deleteZone + id, {
      withCredentials: true,
    });
  }

  toggleActive(id: string, isActive: boolean): Observable<Zone> {
    return this.updateZone(id, { isActive });
  }

  getDevicesByZone(zoneId: string) {
    return this.http.get<Device[]>(
      `${API_URLS.zones.getDevicesByZone}${zoneId}/devices`,
      { withCredentials: true }
    );
  }
}