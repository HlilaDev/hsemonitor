import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SidebarBrand, SidebarSection } from './sidebar.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslateModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  @Input({ required: true }) sections: SidebarSection[] = [];

  @Input() brand: SidebarBrand = {
    title: 'HSE',
    accent: 'Monitor',
    subtitle: 'hseMonitor',
    logoSrc: 'assets/images/logo.png',
    homeLink: '/',
  };
}