import { Routes } from '@angular/router';

export const TRAININGS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./trainings-overview/trainings-overview')
        .then(m => m.TrainingsOverview),
  },
    {
    path: ':id',
    loadComponent: () =>
      import('./training-details/training-details')
        .then(m => m.TrainingDetails),
  }
];