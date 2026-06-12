import { CommonModule, LowerCasePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { DeviceServices } from '../../../core/services/devices/device-services';
import { EmployeeServices } from '../../../core/services/employees/employee-services';
import { UserServices } from '../../../core/services/users/user-services';
import { SensorServices } from '../../../core/services/sensors/sensor-services';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, LowerCasePipe],
  templateUrl: './dashboard-admin.html',
  styleUrl: './dashboard-admin.scss',
})
export class DashboardAdmin {
  private deviceService   = inject(DeviceServices);
  private employeeService = inject(EmployeeServices);
  private userService     = inject(UserServices);
  private sensorService   = inject(SensorServices);

  today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  private stats: Record<string, number> = {
    devices: 0, employees: 0, users: 0, sensors: 0
  };

  getWidget(key: string): number {
    return this.stats[key] ?? 0;
  }

  constructor() {
    this.loadStats();
  }

  private loadStats() {
    this.deviceService.getAllDevices().subscribe({
      next: (res: any) => {
        const items = res?.items ?? res?.devices ?? res ?? [];
        this.stats['devices'] = Array.isArray(items) ? items.length : 0;
      },
      error: () => { this.stats['devices'] = 0; },
    });

    this.employeeService.getAllEmployees().subscribe({
      next: (res: any) => {
        const items = res?.items ?? res?.employees ?? res ?? [];
        this.stats['employees'] = Array.isArray(items) ? items.length : 0;
      },
      error: () => { this.stats['employees'] = 0; },
    });

    this.userService.getAllUsers().subscribe({
      next: (res: any) => {
        const items = res?.items ?? res?.users ?? res ?? [];
        this.stats['users'] = Array.isArray(items) ? items.length : 0;
      },
      error: () => { this.stats['users'] = 0; },
    });

    this.sensorService.list().subscribe({
      next: (res: any) => {
        const items = res?.items ?? res?.sensors ?? res?.data ?? res ?? [];
        this.stats['sensors'] = Array.isArray(items) ? items.length : 0;
      },
      error: () => { this.stats['sensors'] = 0; },
    });
  }
}
