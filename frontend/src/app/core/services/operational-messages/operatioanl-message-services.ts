import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URLS } from '../../config/api_urls';

export type OperationalMessageType = 'info' | 'warning' | 'alert' | 'emergency';
export type OperationalMessagePriority = 'low' | 'normal' | 'high' | 'critical';
export type OperationalMessageTargetType = 'device' | 'zone' | 'broadcast';
export type OperationalMessageDisplayMode = 'once' | 'repeat' | 'persistent';
export type OperationalMessageStatus =
  | 'draft'
  | 'queued'
  | 'sent'
  | 'delivered'
  | 'displayed'
  | 'failed'
  | 'expired'
  | 'cancelled';

export interface OperationalMessage {
  _id: string;
  title?: string;
  content: string;
  messageType: OperationalMessageType | string;
  priority: OperationalMessagePriority | string;
  targetType: OperationalMessageTargetType | string;
  targetDevice?: string | { _id: string; name?: string; deviceId?: string } | null;
  targetZone?: string | { _id: string; name?: string } | null;
  displayMode?: OperationalMessageDisplayMode | string;
  durationSeconds?: number;
  status?: OperationalMessageStatus | string;
  scheduledAt?: string | null;
  sentAt?: string | null;
  displayedAt?: string | null;
  expiresAt?: string | null;
  mqttTopic?: string;
  payload?: any;
  notes?: string;
  createdBy?:
    | string
    | {
        _id: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        role?: string;
      };
  company?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOperationalMessageDto {
  title?: string;
  content: string;
  messageType?: OperationalMessageType | string;
  priority?: OperationalMessagePriority | string;
  targetType: OperationalMessageTargetType | string;
  targetDevice?: string | null;
  targetZone?: string | null;
  displayMode?: OperationalMessageDisplayMode | string;
  durationSeconds?: number;
  scheduledAt?: string | null;
  expiresAt?: string | null;
  notes?: string;
}

export interface UpdateOperationalMessageDto {
  title?: string;
  content?: string;
  messageType?: OperationalMessageType | string;
  priority?: OperationalMessagePriority | string;
  targetType?: OperationalMessageTargetType | string;
  targetDevice?: string | null;
  targetZone?: string | null;
  displayMode?: OperationalMessageDisplayMode | string;
  durationSeconds?: number;
  scheduledAt?: string | null;
  expiresAt?: string | null;
  notes?: string;
  status?: OperationalMessageStatus | string;
}

export interface OperationalMessageQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  targetType?: string;
  search?: string;
}

export interface OperationalMessageListResponse {
  items: OperationalMessage[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class OperationalMessageServices {
  private http = inject(HttpClient);
  private apiUrl = API_URLS.displayMessages;

  createMessage(payload: CreateOperationalMessageDto): Observable<{
    message: string;
    item: OperationalMessage;
  }> {
    return this.http.post<{ message: string; item: OperationalMessage }>(
      this.apiUrl,
      payload
    );
  }

  getMessages(
    params?: OperationalMessageQueryParams
  ): Observable<OperationalMessageListResponse> {
    let httpParams = new HttpParams();

    if (params?.page !== undefined) {
      httpParams = httpParams.set('page', params.page);
    }

    if (params?.limit !== undefined) {
      httpParams = httpParams.set('limit', params.limit);
    }

    if (params?.status) {
      httpParams = httpParams.set('status', params.status);
    }

    if (params?.targetType) {
      httpParams = httpParams.set('targetType', params.targetType);
    }

    if (params?.search) {
      httpParams = httpParams.set('search', params.search);
    }

    return this.http.get<OperationalMessageListResponse>(this.apiUrl, {
      params: httpParams,
    });
  }

  getMessageById(id: string): Observable<OperationalMessage> {
    return this.http.get<OperationalMessage>(`${this.apiUrl}/${id}`);
  }

  updateMessage(
    id: string,
    payload: UpdateOperationalMessageDto
  ): Observable<{
    message: string;
    item: OperationalMessage;
  }> {
    return this.http.put<{ message: string; item: OperationalMessage }>(
      `${this.apiUrl}/${id}`,
      payload
    );
  }

  deleteMessage(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  publishMessage(id: string): Observable<{
    message: string;
    item: OperationalMessage;
  }> {
    return this.http.patch<{ message: string; item: OperationalMessage }>(
      `${this.apiUrl}/${id}/publish`,
      {}
    );
  }

  cancelMessage(id: string): Observable<{
    message: string;
    item: OperationalMessage;
  }> {
    return this.http.patch<{ message: string; item: OperationalMessage }>(
      `${this.apiUrl}/${id}/cancel`,
      {}
    );
  }
}