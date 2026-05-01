import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_URLS } from '../../config/api_urls';
import { Observable } from 'rxjs';

export type SensorStatus = 'online' | 'offline' | 'maintenance';
export type SensorType = 'temperature' | 'gas' | 'humidity' | 'noise' | 'motion';

export interface SensorDevice {
  _id: string;
  name?: string;
  deviceId: string;
}

export interface Sensor {
  _id: string;
  name: string;

  // Selon backend ancien/nouveau
  deviceId?: string;
  device?: string | SensorDevice;

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

export interface Reading {
  _id: string;
  device?: string;
  zone?: string;
  deviceId?: string;
  sensorType: string;
  ts: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;

  values: {
    temperature?: number;
    humidity?: number;
    value?: number;
    gas?: number;
    ppm?: number;
    unit?: string;
    [key: string]: any;
  };

  raw?: {
    deviceId?: string;
    sensorType?: string;
    value?: number;
    unit?: string;
    timestamp?: number;
    [key: string]: any;
  };
}

export interface CreateSensorDto {
  name: string;
  deviceId?: string;
  device?: string;
  type: SensorType | string;
  zone: string;
  threshold?: number | null;
  unit?: string | null;
}

export interface UpdateSensorDto {
  name?: string;
  deviceId?: string;
  device?: string;
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

  create(dto: CreateSensorDto): Observable<Sensor> {
    return this.http.post<Sensor>(API_URLS.sensors.addSensor, dto, {
      withCredentials: true,
    });
  }

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

  getById(id: string): Observable<Sensor> {
    return this.http.get<Sensor>(API_URLS.sensors.getSensorById + id, {
      withCredentials: true,
    });
  }

  update(id: string, dto: UpdateSensorDto): Observable<Sensor> {
    return this.http.put<Sensor>(API_URLS.sensors.editSensor + id, dto, {
      withCredentials: true,
    });
  }

  updateStatus(id: string, status: SensorStatus): Observable<Sensor> {
    return this.http.patch<Sensor>(
      API_URLS.sensors.updateStatus(id),
      { status },
      { withCredentials: true }
    );
  }

  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      API_URLS.sensors.deleteSensor + id,
      { withCredentials: true }
    );
  }

  getHistoryByDevice(
    deviceId: string,
    sensorType?: string,
    limit = 100
  ): Observable<Reading[]> {
    let params = new HttpParams().set('limit', String(limit));

    if (sensorType) {
      params = params.set('sensorType', sensorType);
    }

    return this.http.get<Reading[]>(
      API_URLS.readings.historyByDevice(deviceId),
      {
        params,
        withCredentials: true,
      }
    );
  }
}