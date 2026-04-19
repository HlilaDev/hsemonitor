import { Routes } from '@angular/router';

export const OBSERVATIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./observations-overview/observations-overview')
        .then(m => m.ObservationsOverview),
  },
    {
    path: ':id',
    loadComponent: () =>
      import('./observation-details/observation-details')
        .then(m => m.ObservationDetails),
  },
  

];