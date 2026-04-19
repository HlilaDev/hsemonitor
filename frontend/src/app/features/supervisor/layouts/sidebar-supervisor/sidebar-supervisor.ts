import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
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
  imports: [RouterLink, RouterLinkActive , TranslateModule , CommonModule],
  templateUrl: './sidebar-supervisor.html',
  styleUrl: './sidebar-supervisor.scss',
})
export class SidebarSupervisor {
   sections: SidebarSection[] = [
    {
      titleKey: 'SIDEBAR.SECTIONS.MAIN',
      items: [
        { labelKey: 'SIDEBAR.MENU.DASHBOARD', icon: 'bi bi-grid', route: '/agent', exact: true },
        { labelKey: 'SIDEBAR.MENU.OBSERVATIONS', icon: 'bi bi-eye', route: '/agent/observations' },
        { labelKey: 'SIDEBAR.MENU.MONITORING', icon: 'bi bi-cpu', route: '/agent/devices' },
      ],
    },
    {
      titleKey: 'SIDEBAR.SECTIONS.HSE',
      items: [
        { labelKey: 'SIDEBAR.MENU.INCIDENTS', icon: 'bi bi-exclamation-triangle', route: '/agent/incidents' },
        { labelKey: 'SIDEBAR.MENU.AUDITS', icon: 'bi bi-clipboard-check', route: '/agent/audits' },
                { labelKey: 'SIDEBAR.MENU.INSPECTIONS', icon: 'bi bi-clipboard-check', route: '/agent/inspections' },
        { labelKey: 'SIDEBAR.MENU.TRAINING', icon: 'bi bi-mortarboard', route: '/agent/trainings' },
      ],
    },
  ];

  brand = {
    title: 'HSE',
    accent: 'Supervisor',
    subtitle: 'hseMonitor',
    logoSrc: 'assets/images/logo.png',
    homeLink: '/super',
  };
}