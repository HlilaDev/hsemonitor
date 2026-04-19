import { Routes } from '@angular/router';

export const ADMINS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./all-admins/all-admins')
        .then(m => m.AllAdmins),
  },

    {
    path: 'add',
    loadComponent: () =>
      import('./add-admin/add-admin')
        .then(m => m.AddAdmin),
  },
 

];