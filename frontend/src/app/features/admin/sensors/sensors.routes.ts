import { Routes } from '@angular/router';

export const SENSORS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./all-sensors/all-sensors')
        .then(m => m.AllSensors),
  },
  {
    path: 'add',
    loadComponent: () =>
      import('./add-sensor/add-sensor')
        .then(m => m.AddSensor),
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./edit-sensor/edit-sensor')
        .then(m => m.EditSensor),
  },
   {
    path: ':id',
    loadComponent: () =>
      import('./sensor-details/sensor-details')
        .then(m => m.SensorDetails),
  },
];