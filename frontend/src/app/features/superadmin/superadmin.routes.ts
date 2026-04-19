import { Routes } from '@angular/router';

export const SUPERADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layouts/super-layout/super-layout')
        .then(m => m.SuperLayout), // ✅ shell with <router-outlet>
    children: [
      // ✅ /Supervisor → dashboard
      {
        path: '',
        loadComponent: () =>
          import('./super-admin-dashboard/super-admin-dashboard')
            .then(m => m.SuperAdminDashboard),
      },
           // ✅ /Companies
      {
        path: 'companies',
        loadChildren: () =>
          import('./companies/companies.routes')
            .then(m => m.COMPANIES_ROUTES),
      },

                 // ✅ /admins
      {
        path: 'admins',
        loadChildren: () =>
          import('./admins/admins.routes')
            .then(m => m.ADMINS_ROUTES),
      },
      

    ],

    
  },
];