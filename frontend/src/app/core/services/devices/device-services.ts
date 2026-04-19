import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URLS } from '../../config/api_urls';

// Zone: soit string (ObjectId), soit objet populé
export type ZoneRef = string | { _id: string; name?: string };

export type DeviceStatus = 'online' | 'offline';

export interface Device {
  _id?: string;
  deviceId: string;
  name?: string;
  zone: ZoneRef;

  sensors: string[];
  status: DeviceStatus;
  lastSeen?: string | Date | null;

  description?: string;

  createdAt?: string;
  updatedAt?: string;
}

export type CreateDevicePayload = {
  deviceId: string;
  name?: string;
  zone: string;
  sensors: string[];
  status: DeviceStatus;
  description?: string;
};

export type UpdateDevicePayload = Partial<CreateDevicePayload>;

export interface SensorLite {
  _id: string;
  name: string;
  type?: string;
  status?: string;
  unit?: string;
  threshold?: number;
  zone?: ZoneRef;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class DeviceServices {
  private http = inject(HttpClient);

  private byId(url: string, id: string) {
    return url.endsWith('/') ? `${url}${id}` : `${url}/${id}`;
  }

  // GET /devices
  getAllDevices(params?: {
    page?: number;
    limit?: number;
    search?: string;
    zoneId?: string;
    status?: DeviceStatus;
  }): Observable<any> {
    return this.http.get<any>(API_URLS.devices.allDevices, {
      params: (params ?? {}) as any,
    });
  }

  // GET /devices/:id
  getDeviceById(id: string): Observable<any> {
    return this.http.get<any>(this.byId(API_URLS.devices.getDeviceById, id));
  }

  // POST /devices
  addDevice(payload: CreateDevicePayload): Observable<any> {
    return this.http.post<any>(API_URLS.devices.addDevice, payload);
  }

  // PUT /devices/:id
  editDevice(id: string, payload: UpdateDevicePayload): Observable<any> {
    return this.http.put<any>(
      this.byId(API_URLS.devices.editDevice, id),
      payload
    );
  }

  // DELETE /devices/:id
  deleteDevice(id: string): Observable<any> {
    return this.http.delete<any>(this.byId(API_URLS.devices.deleteDevice, id));
  }

  // GET /devices/:id/sensors
  getDeviceSensors(deviceId: string): Observable<{ items: SensorLite[] }> {
    const base = this.byId(API_URLS.devices.deviceSensors, deviceId);
    return this.http.get<{ items: SensorLite[] }>(`${base}/sensors`);
  }


  // POST /devices/:id/restart
  restartDevice(id: string): Observable<any> {
    const base = this.byId(API_URLS.devices.restartDevice, id);
    return this.http.post<any>(`${base}/restart`, {});
  }
}