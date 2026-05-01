import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URLS } from '../../config/api_urls';
import { Observable } from 'rxjs';

export interface AiPrediction {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  score: number;
  summary: string;
  probableCauses: string[];
  recommendations: string[];
  priorityActions: string[];
}

@Injectable({ providedIn: 'root' })
export class AiPredictionServices {
  constructor(private http: HttpClient) {}

  predictZoneRisk(zoneId: string): Observable<{
    zone: string;
    generatedAt: string;
    prediction: AiPrediction;
  }> {
    return this.http.get<{
      zone: string;
      generatedAt: string;
      prediction: AiPrediction;
    }>(API_URLS.aiPredictions.zoneRisk(zoneId), {
      withCredentials: true,
    });
  }
}
