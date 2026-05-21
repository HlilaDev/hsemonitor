import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URLS } from '../../../config/api_urls';

export interface IncidentStats {
  total: number;

  open: {
    count: number;
    trend: number;
  };

  closed: {
    count: number;
  };

  weekly: {
    current: number;
    previous: number;
  };

  bySeverity: {
    severity: string;
    count: number;
  }[];

  byStatus: {
    status: string;
    count: number;
  }[];

  byZone: {
    zoneId: string;
    zoneName: string;
    count: number;
  }[];

  recent: any[];
}

@Injectable({
  providedIn: 'root',
})
export class IncidentsStatsServices {
  private readonly http = inject(HttpClient);

  /**
   * 📊 Get incidents statistics
   */
  getStats(): Observable<{ success: boolean; data: IncidentStats }> {
    return this.http.get<{ success: boolean; data: IncidentStats }>(
      API_URLS.stats.incidents,
      {
        withCredentials: true,
      }
    );
  }
}