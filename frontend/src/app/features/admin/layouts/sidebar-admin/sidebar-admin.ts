import { Component } from '@angular/core';
import { Sidebar } from '../../../../shared/sidebar/sidebar';
import { ADMIN_SECTIONS } from '../../../../shared/sidebar/config/admin.sidebar.config';

@Component({
  selector: 'app-sidebar-admin',
  standalone: true,
  imports: [Sidebar],
  template: `
    <app-sidebar
      [sections]="sections"
      [brand]="brand">
    </app-sidebar>
  `, 
})
export class SidebarAdmin {
  sections = ADMIN_SECTIONS;

  brand = {
    title: 'Admin',
    accent: 'Panel',
    subtitle: 'hseMonitor',
    logoSrc: 'assets/images/logo.png',
    homeLink: '/admin',
  };
}