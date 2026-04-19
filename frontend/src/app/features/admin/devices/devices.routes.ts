import { Routes } from '@angular/router';

export const DEVICES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./all-devices/all-devices').then(m => m.AllDevices),
  },
  {
    path: 'add',
    loadComponent: () =>
      import('./add-device/add-device').then(m => m.AddDevice),
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./edit-device/edit-device').then(m => m.EditDevice),
  },
    {
    path: 'management/:id',
    loadComponent: () =>
      import('./device-management/device-management').then(m => m.DeviceManagement),
  },
    {
    path: ':id',
    loadComponent: () =>
      import('./device-details/device-details').then(m => m.DeviceDetails),
  },
];