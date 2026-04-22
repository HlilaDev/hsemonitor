import { Routes } from '@angular/router';
import { NotificationsList } from '../../shared/notifications/notifications-list/notifications-list';
import { IncidentsOverview } from '../../shared/incidents/incidents-overview/incidents-overview';
import { Profile } from '../account/profile/profile';

export const SUPERVISOR_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layouts/layout-supervisor/layout-supervisor').then(
        (m) => m.LayoutSupervisor
      ),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./supervisor-dashboard/supervisor-dashboard').then(
            (m) => m.SupervisorDashboard
          ),
      },

      {
        path: 'observations',
        loadChildren: () =>
          import('../hseManagers/observations/observations.routes').then(
            (m) => m.OBSERVATIONS_ROUTES
          ),
      },

      {
        path: 'audits',
        loadChildren: () =>
          import('../hseManagers/audits/audits.routes').then(
            (m) => m.MONITORING_ROUTES
          ),
      },

      {
        path: 'inspections',
        loadChildren: () =>
          import('../hseAgents/inspections.routes').then(
            (m) => m.OBSERVATIONS_ROUTES
          ),
      },

      {
        path: 'trainings',
        loadChildren: () =>
          import('../hseManagers/trainings/trainings.routes').then(
            (m) => m.TRAININGS_ROUTES
          ),
      },

      {
        path: 'incidents',
        component: IncidentsOverview,
      },

      {
        path: 'notifications',
        component: NotificationsList,
      },

      {
        path: 'profile',
        component: Profile,
      },
    ],
  },
];