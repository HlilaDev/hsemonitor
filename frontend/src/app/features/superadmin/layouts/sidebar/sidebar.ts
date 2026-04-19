import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

type SidebarItem = {
  label: string;
  icon: string;
  route: string;
  exact?: boolean;
};

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  readonly brand = signal('HSE Platform');

  readonly menuItems = signal<SidebarItem[]>([
    {
      label: 'Dashboard',
      icon: 'bi bi-grid',
      route: '/super',
      exact: true,
    },
    {
      label: 'Companies',
      icon: 'bi bi-buildings',
      route: '/super/companies',
      exact: false,
    },
    {
      label: 'Admins',
      icon: 'bi bi-people',
      route: '/super/admins',
      exact: false,
    },
    {
      label: 'Statistics',
      icon: 'bi bi-bar-chart',
      route: '/super/statistics',
      exact: false,
    },
    {
      label: 'Settings',
      icon: 'bi bi-gear',
      route: '/super/settings',
      exact: false,
    },
  ]);
}