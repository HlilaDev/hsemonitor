export type SidebarItem = {
  labelKey: string;      // ex: 'SIDEBAR.MENU.DASHBOARD'
  icon: string;          // ex: 'bi bi-grid'
  route: string;         // ex: '/admin/zones'
  exact?: boolean;
};

export type SidebarSection = {
  titleKey: string;      // ex: 'SIDEBAR.SECTIONS.MAIN'
  items: SidebarItem[];
};

export type SidebarBrand = {
  title: string;         // ex: 'Admin'
  accent: string;        // ex: 'Panel'
  subtitle?: string;     // ex: 'hseMonitor'
  logoSrc?: string;      // ex: 'assets/images/logo.png'
  homeLink?: string;     // ex: '/admin'
};