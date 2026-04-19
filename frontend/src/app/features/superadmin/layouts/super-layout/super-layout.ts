import { Component, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';

@Component({
  selector: 'app-super-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, Header, Sidebar],
  templateUrl: './super-layout.html',
  styleUrl: './super-layout.scss',
})
export class SuperLayout {
  sidebarOpen = signal(true);
  isMobile = signal(false);

  constructor() {
    this.checkViewport();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkViewport();
  }

  onToggleSidebar(): void {
    if (this.isMobile()) {
      this.sidebarOpen.set(!this.sidebarOpen());
      return;
    }

    this.sidebarOpen.set(!this.sidebarOpen());
  }

  closeSidebar(): void {
    if (this.isMobile()) {
      this.sidebarOpen.set(false);
    }
  }

  private checkViewport(): void {
    const mobile = window.innerWidth < 992;
    this.isMobile.set(mobile);

    if (mobile) {
      this.sidebarOpen.set(false);
    } else {
      this.sidebarOpen.set(true);
    }
  }
}