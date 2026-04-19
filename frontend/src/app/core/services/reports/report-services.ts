// src/app/core/services/reports/report-services.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URLS } from '../../config/api_urls'; // Assurez-vous que le chemin est correct

@Injectable({
  providedIn: 'root',
})
export class ReportServices {
  
  constructor(private http: HttpClient) {}

  // Créer un rapport
  createReport(reportData: any): Observable<any> {
    return this.http.post<any>(API_URLS.reports.create, reportData);
  }

  // Lister tous les rapports
  listReports(): Observable<any[]> {
    return this.http.get<any[]>(API_URLS.reports.list);
  }

  // Obtenir un rapport par ID
  getReportById(id: string): Observable<any> {
    return this.http.get<any>(API_URLS.reports.byId(id));
  }

  // Mettre à jour un rapport
  updateReport(id: string, reportData: any): Observable<any> {
    return this.http.patch<any>(API_URLS.reports.update(id), reportData);
  }

  // Mettre à jour les métriques d'un rapport
  updateReportMetrics(id: string, metricsData: any): Observable<any> {
    return this.http.patch<any>(API_URLS.reports.updateMetrics(id), metricsData);
  }

  // Supprimer un rapport
  deleteReport(id: string): Observable<any> {
    return this.http.delete<any>(API_URLS.reports.delete(id));
  }
}