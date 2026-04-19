import { Component, OnInit, inject } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { StatCard } from '../../../shared/components/stat-card/stat-card';
import { AuthServices } from '../../../core/services/auth/auth-services';
import { ObservationService } from '../../../core/services/observations/observation-services';
import { TrainingServices } from '../../../core/services/trainings/training-services';
import { NotificationServices } from '../../../core/services/notifications/notification-services';

@Component({
  selector: 'app-hseagent-dashboard',
  standalone: true,
  imports: [StatCard],
  templateUrl: './hseagent-dashboard.html',
  styleUrl: './hseagent-dashboard.scss',
})
export class HseagentDashboard implements OnInit {
  private authService = inject(AuthServices);
  private observationService = inject(ObservationService);
  private trainingService = inject(TrainingServices);
  private notificationService = inject(NotificationServices);

  loading = true;

  currentAgentId = '';

  myObservationsCount = 0;
  assignedObservationsCount = 0;
  scheduledTrainingsCount = 0;
  completedTrainingsCount = 0;
  unreadNotificationsCount = 0;

  agentName = '';

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;

    this.authService.me().subscribe({
      next: (response: any) => {
        const user = response?.user;
        this.currentAgentId = user?._id || '';
        this.agentName =
          user?.fullName ||
          `${user?.firstName || ''} ${user?.lastName || ''}`.trim() ||
          'Agent';

        if (!this.currentAgentId) {
          this.loading = false;
          return;
        }

        forkJoin({
          myObservations: this.observationService
            .list({
              scope: 'reported',
              reportedBy: this.currentAgentId,
              page: 1,
              limit: 1,
            })
            .pipe(
              catchError((error) => {
                console.error(
                  'Erreur lors du chargement des observations créées:',
                  error
                );
                return of({
                  items: [],
                  meta: { total: 0, page: 1, limit: 1, pages: 1 },
                });
              })
            ),

          assignedObservations: this.observationService
            .list({
              scope: 'assigned',
              assignedTo: this.currentAgentId,
              page: 1,
              limit: 1,
            })
            .pipe(
              catchError((error) => {
                console.error(
                  'Erreur lors du chargement des observations affectées:',
                  error
                );
                return of({
                  items: [],
                  meta: { total: 0, page: 1, limit: 1, pages: 1 },
                });
              })
            ),

          trainings: this.trainingService.getAllTrainings().pipe(
            catchError((error) => {
              console.error('Erreur lors du chargement des formations:', error);
              return of([]);
            })
          ),

          unreadNotifications: this.notificationService.getUnreadCount().pipe(
            catchError((error) => {
              console.error(
                'Erreur lors du chargement des notifications non lues:',
                error
              );
              return of({ count: 0 });
            })
          ),
        }).subscribe({
          next: ({ myObservations, assignedObservations, trainings, unreadNotifications }) => {
            this.myObservationsCount = myObservations?.meta?.total ?? 0;
            this.assignedObservationsCount =
              assignedObservations?.meta?.total ?? 0;

            const trainingList = Array.isArray(trainings)
              ? trainings
              : trainings?.items || trainings?.data || [];

            this.scheduledTrainingsCount = trainingList.filter(
              (training: any) => training?.status === 'scheduled'
            ).length;

            this.completedTrainingsCount = trainingList.filter(
              (training: any) => training?.status === 'completed'
            ).length;

            this.unreadNotificationsCount = unreadNotifications?.count ?? 0;

            this.loading = false;
          },
          error: (error) => {
            console.error('Erreur dashboard agent:', error);
            this.loading = false;
          },
        });
      },
      error: (error) => {
        console.error(
          "Erreur lors de la récupération des informations de l'agent:",
          error
        );
        this.loading = false;
      },
    });
  }
}