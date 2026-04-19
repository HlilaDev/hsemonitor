import { Routes } from '@angular/router';
import { ZonesOverview } from '../shared/zones/zones-overview/zones-overview';
import { Profile } from '../account/profile/profile';
import { NotificationsList } from '../../shared/notifications/notifications-list/notifications-list';

export const HSEAGENTS_ROUTES: Routes = [

      {
    path: '',
    loadComponent: () =>
      import('./hseagent-dashboard/hseagent-dashboard')
        .then(m => m.HseagentDashboard),
  },

  { path: 'observations',
    loadChildren: () =>
      import('./observations/observations.routes')
        .then(m => m.OBSERVATIONS_ROUTES),
  },

    { path: 'trainings',
    loadChildren: () =>
      import('./trainings/trainings.routes')
        .then(m => m.TRAININGS_ROUTES),
  },
      { path: 'inspections',
    loadChildren: () =>
      import('./inspections.routes')
        .then(m => m.OBSERVATIONS_ROUTES),
  },

    { path: 'employees',
    loadChildren: () =>
      import('../shared/employees/employees.routes')
        .then(m => m.EMPLOYEES_ROUTES),
  },

    { path: 'zones', component:ZonesOverview
  },

      { path: 'profile', component:Profile
  },
                  //zone details
            { path: 'notifications', component:NotificationsList
          },

  
 
  
];