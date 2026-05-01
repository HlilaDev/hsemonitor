import { Routes } from '@angular/router';

export const INCIDENTS_ROUTES: Routes = [
  {
    path: '',
   
    loadComponent: () =>
      import('./incidents-overview/incidents-overview')
        .then(m => m.IncidentsOverview),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./incident-details/incident-details')
        .then(m => m.IncidentDetails),
  },
];