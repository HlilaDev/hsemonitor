import { Routes } from '@angular/router';

export const ADMIN_SETTINGS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./settings-home/settings-home').then(m => m.AdminSettingsHome),
  },
  {
    path: 'logs',
    loadComponent: () =>
      import('../../hseManagers/settings/session-logs/session-logs').then(
        m => m.SessionLogs
      ),
  },
];
