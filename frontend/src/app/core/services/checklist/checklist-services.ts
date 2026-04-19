import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URLS } from '../../config/api_urls';

export type ChecklistCategory =
  | 'safety'
  | 'environment'
  | 'quality'
  | 'security'
  | 'other';

export type ChecklistItemType = 'boolean' | 'text' | 'number';

export type ChecklistExecutionStatus = 'draft' | 'in_progress' | 'completed';

export interface ChecklistTemplateItemPayload {
  label: string;
  type?: ChecklistItemType;
  isRequired?: boolean;
  order?: number;
}

export interface ChecklistTemplate {
  _id: string;
  title: string;
  description?: string;
  category: ChecklistCategory;
  company?: string;
  createdBy?:
    | string
    | {
        _id?: string;
        firstName?: string;
        lastName?: string;
        fullName?: string;
        email?: string;
        role?: string;
      };
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  items?: ChecklistItem[];
}

export interface ChecklistItem {
  _id: string;
  checklist: string;
  label: string;
  type: ChecklistItemType;
  isRequired: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChecklistExecution {
  _id: string;
  checklist:
    | string
    | {
        _id?: string;
        title?: string;
        description?: string;
        category?: ChecklistCategory;
        items?: ChecklistItem[];
      };
  agent?:
    | string
    | {
        _id?: string;
        firstName?: string;
        lastName?: string;
        fullName?: string;
        email?: string;
        role?: string;
      };
  company?: string;
  zone?:
    | string
    | {
        _id?: string;
        name?: string;
      };
  status: ChecklistExecutionStatus;
  score?: number;
  startedAt?: string;
  completedAt?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  items?: ChecklistItem[];
  responses?: ChecklistResponse[];
}

export interface ChecklistResponse {
  _id: string;
  execution: string;
  item:
    | string
    | {
        _id?: string;
        label?: string;
        type?: ChecklistItemType;
        isRequired?: boolean;
        order?: number;
      };
  value?: boolean | string | number | null;
  comment?: string;
  photo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateChecklistTemplateDto {
  title: string;
  description?: string;
  category?: ChecklistCategory;
  items?: ChecklistTemplateItemPayload[];
}

export interface UpdateChecklistTemplateDto {
  title?: string;
  description?: string;
  category?: ChecklistCategory;
  isActive?: boolean;
}

export interface AddChecklistItemDto {
  label: string;
  type?: ChecklistItemType;
  isRequired?: boolean;
  order?: number;
}

export interface UpdateChecklistItemDto {
  label?: string;
  type?: ChecklistItemType;
  isRequired?: boolean;
  order?: number;
}

export interface StartChecklistExecutionDto {
  checklistId: string;
  title: string;
  zone?: string | null;
  notes?: string;
}

export interface SaveChecklistResponseDto {
  itemId: string;
  value?: boolean | string | number | null;
  comment?: string;
  photo?: string;
}

export interface UpdateChecklistExecutionDto {
  status?: ChecklistExecutionStatus;
  notes?: string;
  zone?: string | null;
}

export interface CompleteChecklistExecutionDto {
  notes?: string;
}

export interface ChecklistExecutionsQuery {
  status?: ChecklistExecutionStatus;
  checklist?: string;
  zone?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ChecklistServices {
  private http = inject(HttpClient);

  // =========================
  // Templates
  // =========================

  getAllTemplates(filters?: {
    isActive?: boolean;
    category?: ChecklistCategory;
  }): Observable<ChecklistTemplate[]> {
    let params = new HttpParams();

    if (filters?.isActive !== undefined) {
      params = params.set('isActive', String(filters.isActive));
    }

    if (filters?.category) {
      params = params.set('category', filters.category);
    }

    return this.http.get<ChecklistTemplate[]>(
      API_URLS.checklists.allTemplates,
      { params }
    );
  }

  getTemplateById(id: string): Observable<ChecklistTemplate> {
    return this.http.get<ChecklistTemplate>(
      API_URLS.checklists.getTemplateById(id)
    );
  }

  createTemplate(
    payload: CreateChecklistTemplateDto
  ): Observable<{
    message: string;
    template: ChecklistTemplate;
    items: ChecklistItem[];
  }> {
    return this.http.post<{
      message: string;
      template: ChecklistTemplate;
      items: ChecklistItem[];
    }>(API_URLS.checklists.addTemplate, payload);
  }

  editTemplate(
    id: string,
    payload: UpdateChecklistTemplateDto
  ): Observable<{
    message: string;
    template: ChecklistTemplate;
  }> {
    return this.http.put<{
      message: string;
      template: ChecklistTemplate;
    }>(API_URLS.checklists.editTemplate(id), payload);
  }

  deleteTemplate(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      API_URLS.checklists.deleteTemplate(id)
    );
  }

  // =========================
  // Template items
  // =========================

  addItemToTemplate(
    templateId: string,
    payload: AddChecklistItemDto
  ): Observable<{
    message: string;
    item: ChecklistItem;
  }> {
    return this.http.post<{
      message: string;
      item: ChecklistItem;
    }>(API_URLS.checklists.addItemToTemplate(templateId), payload);
  }

  editItem(
    itemId: string,
    payload: UpdateChecklistItemDto
  ): Observable<{
    message: string;
    item: ChecklistItem;
  }> {
    return this.http.put<{
      message: string;
      item: ChecklistItem;
    }>(API_URLS.checklists.editItem(itemId), payload);
  }

  deleteItem(itemId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      API_URLS.checklists.deleteItem(itemId)
    );
  }

  // =========================
  // Executions
  // =========================

  getAllExecutions(
    filters?: ChecklistExecutionsQuery
  ): Observable<ChecklistExecution[]> {
    let params = new HttpParams();

    if (filters?.status) {
      params = params.set('status', filters.status);
    }

    if (filters?.checklist) {
      params = params.set('checklist', filters.checklist);
    }

    if (filters?.zone) {
      params = params.set('zone', filters.zone);
    }

    return this.http.get<ChecklistExecution[]>(
      API_URLS.checklists.allExecutions,
      { params }
    );
  }

  getExecutionById(id: string): Observable<ChecklistExecution> {
    return this.http.get<ChecklistExecution>(
      API_URLS.checklists.getExecutionById(id)
    );
  }

  startExecution(
    payload: StartChecklistExecutionDto
  ): Observable<{
    message: string;
    execution: ChecklistExecution;
  }> {
    return this.http.post<{
      message: string;
      execution: ChecklistExecution;
    }>(API_URLS.checklists.startExecution, payload);
  }

  editExecution(
    id: string,
    payload: UpdateChecklistExecutionDto
  ): Observable<{
    message: string;
    execution: ChecklistExecution;
  }> {
    return this.http.put<{
      message: string;
      execution: ChecklistExecution;
    }>(API_URLS.checklists.editExecution(id), payload);
  }

  completeExecution(
    id: string,
    payload?: CompleteChecklistExecutionDto
  ): Observable<{
    message: string;
    execution: ChecklistExecution;
  }> {
    return this.http.put<{
      message: string;
      execution: ChecklistExecution;
    }>(API_URLS.checklists.completeExecution(id), payload || {});
  }

  // =========================
  // Responses
  // =========================

  saveResponse(
    executionId: string,
    payload: SaveChecklistResponseDto
  ): Observable<{
    message: string;
    response: ChecklistResponse;
  }> {
    return this.http.post<{
      message: string;
      response: ChecklistResponse;
    }>(API_URLS.checklists.saveResponse(executionId), payload);
  }
}