import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

type SidebarItem = {
  labelKey: string;
  icon: string;
  route: string;
  exact?: boolean;
};

type SidebarSection = {
  titleKey: string;
  items: SidebarItem[];
};

@Component({
  selector: 'app-sidebar-supervisor',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslateModule],
  templateUrl: './sidebar-supervisor.html',
  styleUrl: './sidebar-supervisor.scss',
})
export class SidebarSupervisor {
  sections: SidebarSection[] = [
    {
      titleKey: 'SIDEBAR.SECTIONS.MAIN',
      items: [
        {
          labelKey: 'SIDEBAR.MENU.DASHBOARD',
          icon: 'bi bi-grid',
          route: '/supervisor',
          exact: true,
        },
        {
          labelKey: 'SIDEBAR.MENU.OBSERVATIONS',
          icon: 'bi bi-eye',
          route: '/supervisor/observations',
        },
        {
          labelKey: 'SIDEBAR.MENU.MONITORING',
          icon: 'bi bi-broadcast',
          route: '/supervisor/notifications',
        },
      ],
    },
    {
      titleKey: 'SIDEBAR.SECTIONS.HSE',
      items: [
        {
          labelKey: 'SIDEBAR.MENU.INCIDENTS',
          icon: 'bi bi-exclamation-triangle',
          route: '/supervisor/incidents',
        },
        {
          labelKey: 'SIDEBAR.MENU.AUDITS',
          icon: 'bi bi-clipboard-check',
          route: '/supervisor/audits',
        },
        {
          labelKey: 'SIDEBAR.MENU.INSPECTIONS',
          icon: 'bi bi-ui-checks-grid',
          route: '/supervisor/inspections',
        },
        {
          labelKey: 'SIDEBAR.MENU.TRAINING',
          icon: 'bi bi-mortarboard',
          route: '/supervisor/trainings',
        },
      ],
    },
  ];

  brand = {
    title: 'HSE',
    accent: 'Supervisor',
    subtitle: 'hseMonitor',
    logoSrc: 'assets/images/logo.png',
    homeLink: '/supervisor',
  };
}