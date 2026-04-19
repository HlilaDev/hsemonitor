import { Routes } from '@angular/router';

export const SETTINGS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./settings-home/settings-home')
        .then(m => m.SettingsHome),
  },
    {  path: 'logs',
    loadComponent: () =>
      import('./session-logs/session-logs')
        .then(m => m.SessionLogs),
  },
    {  path: 'change-password',
    loadComponent: () =>
      import('./change-password/change-password')
        .then(m => m.ChangePassword),
  },
      {  path: 'security',
    loadComponent: () =>
      import('./account-security/account-security')
        .then(m => m.AccountSecurity),
  },
];