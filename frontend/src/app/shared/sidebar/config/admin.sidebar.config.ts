import { SidebarSection } from '../sidebar.model';

export const ADMIN_SECTIONS: SidebarSection[] = [
  {
    titleKey: 'SIDEBAR.SECTIONS.ADMIN',
    items: [
      { labelKey: 'SIDEBAR.MENU.ZONES', icon: 'bi bi-geo-alt', route: '/admin/zones', exact: true },
      { labelKey: 'SIDEBAR.MENU.DEVICES', icon: 'bi bi-cpu', route: '/admin/devices' },
      { labelKey: 'SIDEBAR.MENU.SENSORS', icon: 'bi bi-activity', route: '/admin/sensors' },
      { labelKey: 'SIDEBAR.MENU.EMPLOYEES', icon: 'bi bi-people', route: '/admin/employees' },
      { labelKey: 'SIDEBAR.MENU.USERS', icon: 'bi bi-person-badge', route: '/admin/users' },
      { labelKey: 'SIDEBAR.MENU.SETTINGS', icon: 'bi bi-gear', route: '/admin/settings' }
    ]
  }
];