import { Routes } from '@angular/router';

export const MONITORING_ROUTES: Routes = [


      {
    path: '',
    loadComponent: () =>
      import('./audit-overview/audit-overview')
        .then(m => m.AuditOverview),
  },
  {
    path: 'add',
    loadComponent: () =>
      import('./add-audit/add-audit')
        .then(m => m.AddAudit),
  },

    {
    path: ':id',
    loadComponent: () =>
      import('./audit-details/audit-details')
        .then(m => m.AuditDetails),
  },


];