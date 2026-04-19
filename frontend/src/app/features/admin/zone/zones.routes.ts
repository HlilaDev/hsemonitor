import { Routes } from '@angular/router';

export const ZONES_ROUTES: Routes = [
  // ✅ /admin/zones
  {
    path: '',
    loadComponent: () =>
      import('./all-zones/all-zones').then(m => m.AllZones),
  },

  // ✅ /admin/zones/add
  {
    path: 'add',
    loadComponent: () =>
      import('./add-zone/add-zone').then(m => m.AddZone),
  },

  // ✅ /admin/zones/edit/:id
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./edit-zone/edit-zone').then(m => m.EditZone),
  },
];