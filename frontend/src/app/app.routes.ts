import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { guestGuard } from './core/guards/guest/guest-guard';
import { roleGuard } from './core/guards/role/role-guard';
import { HseagentLayout } from './features/hseAgents/layouts/hseagent-layout/hseagent-layout';

export const routes: Routes = [

  // Auth
  { path: 'login', component: Login, canActivate: [guestGuard] },


     // Guest pages
  {
    path: '',
    loadChildren: () =>
      import('./features/guest/guest.coutes')
        .then(m => m.GUEST_ROUTES),
  },

    // Super routes
  {
    path: 'super',
    loadChildren: () =>
      import('./features/superadmin/superadmin.routes')
        .then(m => m.SUPERADMIN_ROUTES),
    canActivate: [roleGuard],
    data: { roles: ['superAdmin'] } // Seul SuperAdmin peut accéder
  },

  // Admin routes
  {
    path: 'admin',
    loadChildren: () =>
      import('./features/admin/admin.routes')
        .then(m => m.ADMIN_ROUTES),
    canActivate: [roleGuard],
    data: { roles: ['admin'] } // Seul admin peut accéder
  },

      // Super routes
  {
    path: 'supervisor',
    loadChildren: () =>
      import('./features/supervisor/supervisor.routes')
        .then(m => m.SUPERVISOR_ROUTES),
    canActivate: [roleGuard],
    data: { roles: ['supervisor'] } // Seul supervisor peut accéder
  },

  // HSE Manager routes
  {
    path: 'manager',
    loadChildren: () =>
      import('./features/hseManagers/hsemanagers.routes')
        .then(m => m.HSEMANAGERS_ROUTES),
    canActivate: [roleGuard],
    data: { roles: ['manager'] } // Seul hseManager peut accéder
  },

  // HSE Agent routes
  {
    path: 'agent',
    component: HseagentLayout,
    canActivate: [roleGuard],
    data: { roles: ['agent'] }, // Seul agent peut accéder
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/hseAgents/hseagents.routes')
            .then(m => m.HSEAGENTS_ROUTES),
      },
    ],
  },



  // Page non autorisée
  { path: '404', loadComponent: () => import('./shared/pages/not-found/not-found').then(m => m.NotFound) },

  // Catch-all: redirige vers login si route inconnue
  { path: '**', redirectTo: '404' }
];