import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_URLS } from '../../config/api_urls';

@Injectable({
  providedIn: 'root',
})
export class PpeAlertServices {
  private readonly http = inject(HttpClient);

  getAll(): Observable<any> {
    return this.http.get<any>(API_URLS.ppeAlerts.list);
  }

  getById(id: string): Observable<any> {
    return this.http.get<any>(API_URLS.ppeAlerts.byId(id));
  }

  updateStatus(
    id: string,
    body: { status: 'open' | 'acknowledged' | 'resolved' | 'false_positive' }
  ): Observable<any> {
    return this.http.patch<any>(API_URLS.ppeAlerts.updateStatus(id), body);
  }

  delete(id: string): Observable<any> {
    return this.http.delete<any>(API_URLS.ppeAlerts.delete(id));
  }

  getStats(): Observable<any> {
    return this.http.get<any>(API_URLS.ppeAlerts.stats);
  }

  // ✅ NOUVELLE MÉTHODE UPLOAD SNAPSHOT
  uploadSnapshot(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('snapshot', file);

    return this.http.post<any>(
      API_URLS.ppeAlerts.uploadSnapshot,
      formData
    );
  }
}