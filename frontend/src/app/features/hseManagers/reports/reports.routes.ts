import { Routes } from '@angular/router';

export const REPORTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./reports-list/reports-list')
        .then(m => m.ReportsList),
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./report-create/report-create')
        .then(m => m.ReportCreate),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./report-edit/report-edit')
        .then(m => m.ReportEdit),
  }, 
  {
    path: ':id',
    loadComponent: () =>
      import('./report-detail/report-detail')
        .then(m => m.ReportDetail),
  },
];