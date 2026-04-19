import { SidebarSection } from '../sidebar.model';

export const HSEMANAGER_SECTIONS: SidebarSection[] = [
  {
    titleKey: 'SIDEBAR.SECTIONS.MAIN',
    items: [
      { labelKey: 'SIDEBAR.MENU.DASHBOARD', icon: 'bi bi-grid', route: '/manager', exact: true },
      { labelKey: 'SIDEBAR.MENU.ZONES', icon: 'bi bi-geo-alt', route: '/manager/zones' },
      { labelKey: 'SIDEBAR.MENU.EMPLOYEES', icon: 'bi bi-people', route: '/manager/employees' },
    ],
  },
  {
    titleKey: 'SIDEBAR.SECTIONS.HSE_MANAGEMENT',
    items: [
      { labelKey: 'SIDEBAR.MENU.INCIDENTS', icon: 'bi bi-exclamation-triangle', route: '/manager/incidents' },
      { labelKey: 'SIDEBAR.MENU.AUDITS', icon: 'bi bi-clipboard-check', route: '/manager/audits' },
      { labelKey: 'SIDEBAR.MENU.TRAINING', icon: 'bi bi-mortarboard', route: '/manager/trainings' },
      { labelKey: 'SIDEBAR.MENU.MONITORING', icon: 'bi bi-clipboard-check', route: '/manager/monitoring' },
      { labelKey: 'SIDEBAR.MENU.OBSERVATIONS', icon: 'bi bi-file-earmark-bar-graph', route: '/manager/observations' },
      { labelKey: 'SIDEBAR.MENU.REPORTS', icon: 'bi bi-file-earmark-bar-graph', route: '/manager/reports' },
      { labelKey: 'SIDEBAR.MENU.INSPECTIONS', icon: 'bi bi-file-earmark-bar-graph', route: '/manager/inspections' },
                { labelKey: 'SIDEBAR.MENU.PPE', icon: 'bi bi-mortarboard', route: '/manager/ppe' },


      { labelKey: 'SIDEBAR.MENU.TEAM', icon: 'bi bi-mortarboard', route: '/manager/team' },
     { labelKey: 'SIDEBAR.MENU.INVENTORIES', icon: 'bi bi-mortarboard', route: '/manager/inventories' },
        { labelKey: 'SIDEBAR.MENU.OPMESSAGES', icon: 'bi bi-mortarboard', route: '/manager/operational-messages' },


    ],
  },
  {
    titleKey: 'SIDEBAR.SECTIONS.CONFIGURATION',
    items: [
      { labelKey: 'SIDEBAR.MENU.SETTINGS', icon: 'bi bi-gear', route: '/manager/settings' },
    ],
  },
];