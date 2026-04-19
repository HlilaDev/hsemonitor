import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  private readonly KEY = 'sidebar_collapsed';

  // Angular 20: signal (best practice moderne)
  readonly sidebarCollapsed = signal<boolean>(
    localStorage.getItem(this.KEY) === '1'
  );

  toggleSidebar() {
    this.sidebarCollapsed.update(v => {
      const next = !v;
      localStorage.setItem(this.KEY, next ? '1' : '0');
      return next;
    });
  }

  setSidebarCollapsed(value: boolean) {
    this.sidebarCollapsed.set(value);
    localStorage.setItem(this.KEY, value ? '1' : '0');
  }
}