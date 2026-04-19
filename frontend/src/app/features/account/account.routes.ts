import { Routes } from '@angular/router';

export const ACCOUNT_ROUTES: Routes = [
  // ✅ /profile
  {
    path: '',
    loadComponent: () =>
      import('./profile/profile').then(m => m.Profile),
  },

  // ✅ /profile/edit
  {
    path: 'profile/edit',
    loadComponent: () =>
      import('./edit-profile/edit-profile').then(m => m.EditProfile),
  },

  // ✅ /settings
  {
    path: 'settings',
    loadComponent: () =>
      import('./settings/settings').then(m => m.Settings),
  },
];