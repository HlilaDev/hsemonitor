import { Routes } from '@angular/router';

import { LiveStream } from '../../shared/live-stream/live-stream';
import { IncidentsOverview } from '../../shared/incidents/incidents-overview/incidents-overview';
import { IncidentDetails } from '../../shared/incidents/incident-details/incident-details';
import { NotificationsList } from '../../shared/notifications/notifications-list/notifications-list';
import { TemperatureChart } from './temperature-chart/temperature-chart';
import { Profile } from '../account/profile/profile';

export const HSEMANAGERS_ROUTES: Routes = [
  {
    path: '',
     
    loadComponent: () =>
      import('./layouts/hsemanager-layout/hsemanager-layout')
        .then(m => m.HsemanagerLayout), // ✅ shell with <router-outlet>
    children: [
      // ✅ /manager → dashboard
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./hsemanager-dashboard/hsemanager-dashboard')
            .then(m => m.HsemanagerDashboard),
      },
        

                //zone details
          { path: 'chart', component:TemperatureChart
        },

                //notifications details
          { path: 'notifications', component:NotificationsList
        },

                //live
          { path: 'live', component:LiveStream
        },
                        //profile
          { path: 'profile', component:Profile
        },
                //incidents
          { path: 'incidents', component:IncidentsOverview
        },
                        //incidents
          { path: 'incidents/detail', component:IncidentDetails
        },
      // ✅ /manager/trainings
      {
        path: 'trainings',
        loadChildren: () =>
          import('./trainings/trainings.routes')
            .then(m => m.TRAININGS_ROUTES),
      },
            // ✅ /manager/inspections
      {
        path: 'inspections',
        loadChildren: () =>
          import('./Inspections/Inspections.routes')
            .then(m => m.INSPECTIONS_ROUTES),
      },

                  // ✅ /manager/ppe
      {
        path: 'ppe',
        loadChildren: () =>
          import('./ppe-alerts/ppeAlerts.routes')
            .then(m => m.PPEALERTS_ROUTES),
      },

            // ✅ /manager/operational-messages
      {
        path: 'operational-messages',
        loadChildren: () =>
          import('../shared/operational-messages/operational-messages.routes')
            .then(m => m.OPERATIONAL_MESSAGES_ROUTES),
      },
            // ✅ /manager/trainings
      {
        path: 'zones',
        loadChildren: () =>
          import('../shared/zones/zones.routes')
            .then(m => m.EMPLOYEES_ROUTES),
      },
            // ✅ /manager/employees
      {
        path: 'employees',
        loadChildren: () =>
          import('../shared/employees/employees.routes')
            .then(m => m.EMPLOYEES_ROUTES),
      },
            // ✅ /manager/team
      {
        path: 'team',
        loadChildren: () =>
          import('./team/team.routes')
            .then(m => m.TEAM_ROUTES),
      },
            // ✅ /manager/team
      {
        path: 'settings',
        loadChildren: () =>
          import('./settings/settings.routes')
            .then(m => m.SETTINGS_ROUTES),
      },
            // ✅ /manager/audits
      {
        path: 'audits',
        loadChildren: () =>
          import('./audits/audits.routes')
            .then(m => m.MONITORING_ROUTES),
      },

            // ✅ /manager/reports
      {
        path: 'reports',
        loadChildren: () =>
          import('./reports/reports.routes')
            .then(m => m.REPORTS_ROUTES),
      },
                  // ✅ /manager/reports
      {
        path: 'observations',
        loadChildren: () =>
          import('./observations/observations.routes')
            .then(m => m.OBSERVATIONS_ROUTES),
      },
                  // ✅ /manager/team
      {
        path: 'inventories',
        loadChildren: () =>
          import('./inventories/inventories.routes')
            .then(m => m.INVENTORIES_ROUTES),
      },
    // ✅ /manager/monitoring
      {
        path: 'monitoring',
        loadChildren: () =>
          import('./monitoring/monitoring.routes')
            .then(m => m.MONITORING_ROUTES),
      },
     
      { path: '', redirectTo: '', pathMatch: 'full' },
    ],
  },
];