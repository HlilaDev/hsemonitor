import { Routes } from '@angular/router';

export const MONITORING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./monitoring-dashboard/monitoring-dashboard')
        .then(m => m.MonitoringDashboard),
  },
  {
    path: 'device/:deviceId',
    loadComponent: () =>
      import('./device-monitoring/device-monitoring')
        .then(m => m.DeviceMonitoring),
  }, 
    {
    path: 'zone/:zoneId',
    loadComponent: () =>
      import('./zone-monitoring/zone-monitoring')
        .then(m => m.ZoneMonitoring),
  }, 

];