import { SidebarSection } from '../sidebar.model';

export const HSEMANAGER_SECTIONS: SidebarSection[] = [
  {
    titleKey: 'SIDEBAR.SECTIONS.MANAGER_MAIN',
    items: [
      { labelKey: 'SIDEBAR.MENU.DASHBOARD', icon: 'bi bi-speedometer2', route: '/manager', exact: true },
      { labelKey: 'SIDEBAR.MENU.MONITORING', icon: 'bi bi-activity', route: '/manager/monitoring' },
      { labelKey: 'SIDEBAR.MENU.OPMESSAGES', icon: 'bi bi-chat-dots', route: '/manager/operational-messages' },
 
    ],
  },
  {
    titleKey: 'SIDEBAR.SECTIONS.HSE_MANAGEMENT',
    items: [
      { labelKey: 'SIDEBAR.MENU.INCIDENTS', icon: 'bi bi-exclamation-octagon', route: '/manager/incidents' },
      { labelKey: 'SIDEBAR.MENU.AUDITS', icon: 'bi bi-clipboard-check', route: '/manager/audits' },
      { labelKey: 'SIDEBAR.MENU.REPORTS', icon: 'bi bi-bar-chart-line', route: '/manager/reports' },
      { labelKey: 'SIDEBAR.MENU.OBSERVATIONS', icon: 'bi bi-eye', route: '/manager/observations' },
      { labelKey: 'SIDEBAR.MENU.INSPECTIONS', icon: 'bi bi-search', route: '/manager/inspections' },
      { labelKey: 'SIDEBAR.MENU.PPE', icon: 'bi bi-shield-check', route: '/manager/ppe' },
      { labelKey: 'SIDEBAR.MENU.TRAINING', icon: 'bi bi-mortarboard-fill', route: '/manager/trainings' },

    ],
  },
    {
    titleKey: 'SIDEBAR.SECTIONS.HSE_MANAGEMENT_RESSOURCES',
    items: [
      { labelKey: 'SIDEBAR.MENU.ZONES', icon: 'bi bi-map', route: '/manager/zones' },
      { labelKey: 'SIDEBAR.MENU.EMPLOYEES', icon: 'bi bi-people-fill', route: '/manager/employees' },
      { labelKey: 'SIDEBAR.MENU.TEAM', icon: 'bi bi-diagram-3', route: '/manager/team' },
      { labelKey: 'SIDEBAR.MENU.INVENTORIES', icon: 'bi bi-box-seam', route: '/manager/inventories' },

    ],
  },
  
];