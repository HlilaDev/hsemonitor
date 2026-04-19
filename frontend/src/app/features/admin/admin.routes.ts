import { Routes } from '@angular/router';
import { NotificationsList } from '../../shared/notifications/notifications-list/notifications-list';
import { Profile } from '../account/profile/profile';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layouts/layout-admin/layout-admin').then(m => m.LayoutAdmin),
    children: [ 
      // ✅ /admin → dashboard
      {
        path: '',
        loadComponent: () =>
          import('./dashboard-admin/dashboard-admin').then(m => m.DashboardAdmin),
      },

      { path: 'profile', component: Profile },

      // ✅ /admin/zones → lazy-load zones.routes.ts
      {
        path: 'zones',
        loadChildren: () =>
          import('./zone/zones.routes').then(m => m.ZONES_ROUTES),
      },
   
      {path:'notifications', component:NotificationsList},

      // ✅ /admin/devices
      {
        path: 'devices',
        loadChildren: () =>
          import('./devices/devices.routes').then(m => m.DEVICES_ROUTES),
      },

      {
       path: 'employees',
        loadChildren: () =>
         import('./employees/employees.routes')
        .then(m => m.EMPLOYEES_ROUTES),
},
      {
       path: 'sensors',
        loadChildren: () =>
         import('./sensors/sensors.routes')
        .then(m => m.SENSORS_ROUTES),
},

      {
       path: 'users',
        loadChildren: () =>
         import('./users/users.routes')
        .then(m => m.USERS_ROUTES),
},
    ],
  },
];