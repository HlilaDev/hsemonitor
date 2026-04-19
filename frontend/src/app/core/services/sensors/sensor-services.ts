import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_URLS } from '../../config/api_urls'; 
import { Observable } from 'rxjs';

export type SensorStatus = 'online' | 'offline' | 'maintenance';
export type SensorType = 'temperature' | 'gas' | 'humidity' | 'noise' | 'motion';

export interface Sensor {
  _id: string;
  name: string;
  deviceId: string;
  imageUrl: string;
  type: SensorType | string;
  zone: string | { _id: string; name: string };
  status: SensorStatus;
  threshold?: number | null;
  unit?: string | null;
  lastSeen?: string | Date | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSensorDto {
  name: string;
  deviceId: string;
  type: SensorType | string;
  zone: string;
  threshold?: number | null;
  unit?: string | null;
}

export interface UpdateSensorDto {
  name?: string;
  type?: SensorType | string;
  zone?: string;
  threshold?: number | null;
  unit?: string | null;
  status?: SensorStatus;
}

@Injectable({
  providedIn: 'root',
})
export class SensorServices {
  private http = inject(HttpClient);

  // ✅ CREATE
  create(dto: CreateSensorDto): Observable<Sensor> {
    return this.http.post<Sensor>(API_URLS.sensors.addSensor, dto, {
      withCredentials: true,
    });
  }

  // ✅ LIST + filters
  list(filters?: {
    zone?: string;
    type?: string;
    status?: string;
    q?: string;
  }): Observable<Sensor[]> {
    let params = new HttpParams();
    if (filters?.zone) params = params.set('zone', filters.zone);
    if (filters?.type) params = params.set('type', filters.type);
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.q) params = params.set('q', filters.q);

    return this.http.get<Sensor[]>(API_URLS.sensors.allSensors, {
      params,
      withCredentials: true,
    });
  }

  // ✅ GET BY ID
  getById(id: string): Observable<Sensor> {
    return this.http.get<Sensor>(API_URLS.sensors.getSensorById + id, {
      withCredentials: true,
    });
  }

  // ✅ UPDATE
  update(id: string, dto: UpdateSensorDto): Observable<Sensor> {
    return this.http.put<Sensor>(API_URLS.sensors.editSensor + id, dto, {
      withCredentials: true,
    });
  }

  // ✅ UPDATE STATUS (PATCH /sensors/:id/status)
  updateStatus(id: string, status: SensorStatus): Observable<Sensor> {
    return this.http.patch<Sensor>(
      API_URLS.sensors.updateStatus(id),
      { status },
      { withCredentials: true }
    );
  }

  // ✅ DELETE
  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(API_URLS.sensors.deleteSensor + id, {
      withCredentials: true,
    });
  }
}