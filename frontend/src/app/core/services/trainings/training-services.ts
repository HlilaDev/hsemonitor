import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URLS } from '../../config/api_urls';

export type TrainingCategory =
  | 'safety'
  | 'environment'
  | 'quality'
  | 'security'
  | 'other';

export type TrainingStatus =
  | 'scheduled'
  | 'completed'
  | 'cancelled';

export type ParticipantStatus =
  | 'planned'
  | 'attended'
  | 'passed'
  | 'failed';

export interface TrainingParticipantPayload {
  employee: string;
  status?: ParticipantStatus;
  score?: number;
  validUntil?: string;
  note?: string;
}

export interface CreateTrainingDto {
  title: string;
  description?: string;
  category: TrainingCategory;
  provider?: string;
  location?: string;
  startDate: string;
  endDate?: string;
  status?: TrainingStatus;
  participants?: TrainingParticipantPayload[];
}

export interface UpdateTrainingDto {
  title?: string;
  description?: string;
  category?: TrainingCategory;
  provider?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  status?: TrainingStatus;
}

export interface UpdateParticipantDto {
  status?: ParticipantStatus;
  score?: number;
  validUntil?: string;
  note?: string;
}

@Injectable({
  providedIn: 'root',
})
export class TrainingServices {
  private http = inject(HttpClient);

  getAllTrainings(): Observable<any> {
    return this.http.get(API_URLS.trainings.allTrainings);
  }

  getTrainingById(id: string): Observable<any> {
    return this.http.get(API_URLS.trainings.getTrainingById(id));
  }

  createTraining(dto: CreateTrainingDto): Observable<any> {
    return this.http.post(API_URLS.trainings.createTraining, dto);
  }

  editTraining(id: string, dto: UpdateTrainingDto): Observable<any> {
    return this.http.put(API_URLS.trainings.editTraining(id), dto);
  }

  deleteTraining(id: string): Observable<any> {
    return this.http.delete(API_URLS.trainings.deleteTraining(id));
  }

  addParticipant(
    id: string,
    participantData: TrainingParticipantPayload
  ): Observable<any> {
    return this.http.post(
      API_URLS.trainings.addParticipant(id),
      participantData
    );
  }

  updateParticipant(
    id: string,
    participantId: string,
    participantData: UpdateParticipantDto
  ): Observable<any> {
    return this.http.patch(
      API_URLS.trainings.updateParticipant(id, participantId),
      participantData
    );
  }

  removeParticipant(id: string, participantId: string): Observable<any> {
    return this.http.delete(
      API_URLS.trainings.removeParticipant(id, participantId)
    );
  }
}