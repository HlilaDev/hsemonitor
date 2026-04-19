import { Routes } from '@angular/router';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./all-users/all-users')
        .then(m => m.AllUsers),
  },
  {
    path: 'add',
    loadComponent: () =>
      import('./add-user/add-user')
        .then(m => m.AddUser),
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./edit-user/edit-user')
        .then(m => m.EditUser),
  },
];