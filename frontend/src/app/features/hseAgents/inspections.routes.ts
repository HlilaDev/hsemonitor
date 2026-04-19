import { Routes } from '@angular/router';

export const OBSERVATIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../shared/inspections/inspection-list/inspection-list')
        .then(m => m.InspectionList),
  },
    {
    path: ':id/fill',
    loadComponent: () =>
      import('../shared/inspections/inspection-fill/inspection-fill')
        .then(m => m.InspectionFill),
  },

];