import { Routes } from '@angular/router';

export const TRAININGS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./trainings-list/trainings-list')
        .then(m => m.TrainingsList),
  },
  // ✅ 'create' MUST come before ':id' — otherwise router treats 'create' as an id
  {
    path: 'create',
    loadComponent: () =>
      import('./training-create/training-create')
        .then(m => m.TrainingCreate),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./training-edit/training-edit')
        .then(m => m.TrainingEdit),
  },
  {
    path: ':id/participants',
    loadComponent: () =>
      import('./training-participants/training-participants')
        .then(m => m.TrainingParticipants),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./training-detail/training-detail')
        .then(m => m.TrainingDetail),
  },
];