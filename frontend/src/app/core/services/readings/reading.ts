import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URLS } from '../../config/api_urls';

// -----------------------------
// Types
// -----------------------------
export interface ReadingDevice {
  _id: string;
  deviceId: string;
  name?: string;
  status?: string;
}

export interface ReadingZone {
  _id: string;
  name?: string;
}

export interface ReadingValues {
  temperature?: number;
  humidity?: number;
  gas?: number;
  [key: string]: any;
}

export interface ReadingItem {
  _id: string;
  device: string | ReadingDevice;
  zone: string | ReadingZone;
  sensorType: string;
  values: ReadingValues;
  raw?: any;
  ts: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReadingListResponse {
  items: ReadingItem[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface GetReadingsParams {
  device?: string;
  zone?: string;
  sensorType?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface GetHistoryParams {
  sensorType?: string;
  from?: string;
  to?: string;
  limit?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ReadingServices {
  private http = inject(HttpClient);

  // -----------------------------
  // Liste paginée avec filtres
  // GET /api/readings
  // -----------------------------
  getReadings(params?: GetReadingsParams): Observable<ReadingListResponse> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.device) {
        httpParams = httpParams.set('device', params.device);
      }
      if (params.zone) {
        httpParams = httpParams.set('zone', params.zone);
      }
      if (params.sensorType) {
        httpParams = httpParams.set('sensorType', params.sensorType);
      }
      if (params.from) {
        httpParams = httpParams.set('from', params.from);
      }
      if (params.to) {
        httpParams = httpParams.set('to', params.to);
      }
      if (params.page != null) {
        httpParams = httpParams.set('page', String(params.page));
      }
      if (params.limit != null) {
        httpParams = httpParams.set('limit', String(params.limit));
      }
    }

    return this.http.get<ReadingListResponse>(API_URLS.readings.list, {
      params: httpParams,
    });
  }

  // -----------------------------
  // GET /api/readings/:id
  // -----------------------------
  getReadingById(id: string): Observable<ReadingItem> {
    return this.http.get<ReadingItem>(API_URLS.readings.byId(id));
  }

  // -----------------------------
  // GET /api/readings/latest/device/:deviceId
  // -----------------------------
  getLatestByDevice(deviceId: string): Observable<ReadingItem> {
    return this.http.get<ReadingItem>(
      API_URLS.readings.latestByDevice(deviceId)
    );
  }

  // -----------------------------
  // GET /api/readings/history/device/:deviceId
  // -----------------------------
  getHistoryByDevice(
    deviceId: string,
    params?: GetHistoryParams
  ): Observable<ReadingItem[]> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.sensorType) {
        httpParams = httpParams.set('sensorType', params.sensorType);
      }
      if (params.from) {
        httpParams = httpParams.set('from', params.from);
      }
      if (params.to) {
        httpParams = httpParams.set('to', params.to);
      }
      if (params.limit != null) {
        httpParams = httpParams.set('limit', String(params.limit));
      }
    }

    return this.http.get<ReadingItem[]>(
      API_URLS.readings.historyByDevice(deviceId),
      { params: httpParams }
    );
  }

  // -----------------------------
  // GET /api/readings/latest/zone/:zoneId
  // -----------------------------
  getLatestByZone(zoneId: string): Observable<ReadingItem[]> {
    return this.http.get<ReadingItem[]>(
      API_URLS.readings.latestByZone(zoneId)
    );
  }

  // -----------------------------
  // Helpers
  // -----------------------------
  getDeviceName(device: string | ReadingDevice | null | undefined): string {
    if (!device) return '—';
    return typeof device === 'string' ? device : (device.name || device.deviceId || '—');
  }

  getZoneName(zone: string | ReadingZone | null | undefined): string {
    if (!zone) return '—';
    return typeof zone === 'string' ? zone : (zone.name || '—');
  }

  getTemperature(reading: ReadingItem | null | undefined): number | null {
    if (!reading?.values) return null;
    return typeof reading.values.temperature === 'number'
      ? reading.values.temperature
      : null;
  }

  getHumidity(reading: ReadingItem | null | undefined): number | null {
    if (!reading?.values) return null;
    return typeof reading.values.humidity === 'number'
      ? reading.values.humidity
      : null;
  }

  getGas(reading: ReadingItem | null | undefined): number | null {
    if (!reading?.values) return null;
    return typeof reading.values.gas === 'number'
      ? reading.values.gas
      : null;
  }
}