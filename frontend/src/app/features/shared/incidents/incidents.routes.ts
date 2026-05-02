import { Routes } from '@angular/router';

export const INCIDENTS_ROUTES: Routes = [
  {
    path: '',
   
    loadComponent: () =>
      import('./incidents-overview/incidents-overview')
        .then(m => m.IncidentsOverview),
  },
    {
    path: 'add',
   
    loadComponent: () =>
      import('./add-incident/add-incident')
        .then(m => m.AddIncident),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./incident-details/incident-details')
        .then(m => m.IncidentDetails),
  },
];