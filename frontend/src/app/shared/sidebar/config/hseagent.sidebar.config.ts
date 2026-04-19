import { SidebarSection } from '../sidebar.model';

export const HSEAGENT_SECTIONS: SidebarSection[] = [
  {
    titleKey: 'SIDEBAR.SECTIONS.MAIN',
    items: [
      { labelKey: 'SIDEBAR.MENU.DASHBOARD', icon: 'bi bi-grid', route: '/hseagent/home', exact: true },
      { labelKey: 'SIDEBAR.MENU.ZONES', icon: 'bi bi-geo-alt', route: '/hseagent/observations' },
      { labelKey: 'SIDEBAR.MENU.DEVICES', icon: 'bi bi-cpu', route: '/hseagent/devices' },
    ],
  },
  {
    titleKey: 'SIDEBAR.SECTIONS.HSE_MANAGEMENT',
    items: [
      { labelKey: 'SIDEBAR.MENU.INCIDENTS', icon: 'bi bi-exclamation-triangle', route: '/hseagent/incidents' },
      { labelKey: 'SIDEBAR.MENU.AUDITS', icon: 'bi bi-clipboard-check', route: '/hseagent/audits' },
      { labelKey: 'SIDEBAR.MENU.TRAINING', icon: 'bi bi-mortarboard', route: '/hseagent/training' },
          { labelKey: 'SIDEBAR.MENU.PPE', icon: 'bi bi-mortarboard', route: '/hseagent/ppe' },
    ],
  },
  {
    titleKey: 'SIDEBAR.SECTIONS.ELEMENTS',
    items: [
      { labelKey: 'SIDEBAR.MENU.CHECKLISTS', icon: 'bi bi-list-check', route: '/hseagent/checklists' },
      { labelKey: 'SIDEBAR.MENU.REPORT', icon: 'bi bi-flag', route: '/hseagent/reports/new' },
    ],
  },
];