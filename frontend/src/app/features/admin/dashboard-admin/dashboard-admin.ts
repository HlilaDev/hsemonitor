import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { StatCard } from '../../../shared/components/stat-card/stat-card';

import { DeviceServices } from '../../../core/services/devices/device-services';
import { EmployeeServices } from '../../../core/services/employees/employee-services';
import { UserServices } from '../../../core/services/users/user-services';
import { SensorServices } from '../../../core/services/sensors/sensor-services'; // ✅ AJOUT

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, StatCard],
  templateUrl: './dashboard-admin.html',
  styleUrl: './dashboard-admin.scss',
})
export class DashboardAdmin {
  private deviceService = inject(DeviceServices);
  private employeeService = inject(EmployeeServices);
  private userService = inject(UserServices);
  private sensorService = inject(SensorServices); // ✅ AJOUT

  widgets = [
    {
      key: 'devices',
      title: 'Devices',
      value: 0,
      subtitle: 'Nombre total des devices',
      iconClass: 'bi bi-cpu',
      variant: 'blue',
      routerLink: ['/admin/devices'],
    },
    {
      key: 'employees',
      title: 'Employees',
      value: 0,
      subtitle: 'Nombre total des employés',
      iconClass: 'bi bi-people',
      variant: 'green',
      routerLink: ['/admin/employees'],
    },
    {
      key: 'users',
      title: 'Users',
      value: 0,
      subtitle: 'Nombre total des utilisateurs',
      iconClass: 'bi bi-person-badge',
      variant: 'orange',
      routerLink: ['/admin/users'],
    },

    // ✅ NEW WIDGET: Sensors
    {
      key: 'sensors',
      title: 'Sensors',
      value: 0,
      subtitle: 'Nombre total des capteurs',
      iconClass: 'bi bi-rss', // ou: 'bi bi-activity'
      variant: 'purple',      // si ton StatCard supporte sinon mets 'blue'
      routerLink: ['/admin/sensors'], // adapte selon tes routes
    },
  ] as const;

  constructor() {
    this.loadStats();
  }

  private loadStats() {
    this.deviceService.getAllDevices().subscribe({
      next: (res: any) => {
        const items = res?.items ?? res?.devices ?? res ?? [];
        this.updateWidget('devices', Array.isArray(items) ? items.length : 0);
      },
      error: () => this.updateWidget('devices', 0),
    });

    this.employeeService.getAllEmployees().subscribe({
      next: (res: any) => {
        const items = res?.items ?? res?.employees ?? res ?? [];
        this.updateWidget('employees', Array.isArray(items) ? items.length : 0);
      },
      error: () => this.updateWidget('employees', 0),
    });

    this.userService.getAllUsers().subscribe({
      next: (res: any) => {
        const items = res?.items ?? res?.users ?? res ?? [];
        this.updateWidget('users', Array.isArray(items) ? items.length : 0);
      },
      error: () => this.updateWidget('users', 0),
    });

    // ✅ SENSORS
    this.sensorService.list().subscribe({
      next: (res: any) => {
        const items = res?.items ?? res?.sensors ?? res?.data ?? res ?? [];
        this.updateWidget('sensors', Array.isArray(items) ? items.length : 0);
      },
      error: () => this.updateWidget('sensors', 0),
    });
  }

  private updateWidget(
    key: 'devices' | 'employees' | 'users' | 'sensors',
    value: number
  ) {
    this.widgets = this.widgets.map(w => (w.key === key ? { ...w, value } : w)) as any;
  }
}