import { Routes } from '@angular/router';

export const PPEALERTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./ppe-alerts-overview/ppe-alerts-overview')
        .then(m => m.PpeAlertsOverview),
  },

  {
      path: ':id',
      loadComponent: () =>
        import('./ppe-alert-detail/ppe-alert-detail').then(
          (m) => m.PpeAlertDetail
        ),
    },
   
  

];