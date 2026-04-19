import { Routes } from '@angular/router';

export const EMPLOYEES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./zones-overview/zones-overview')
        .then(m => m.ZonesOverview),
  },

    {
    path: ':id',
    loadComponent: () =>
      import('./zone-details/zone-details')
        .then(m => m.ZoneDetails),
  },
 

];