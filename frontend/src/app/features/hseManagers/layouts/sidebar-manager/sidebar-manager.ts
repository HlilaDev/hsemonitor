import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { HSEMANAGER_SECTIONS } from '../../../../shared/sidebar/config/hsemanager.sidebar.config';

@Component({
  selector: 'app-sidebar-manager',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslateModule],
  templateUrl: './sidebar-manager.html',
  styleUrl: './sidebar-manager.scss',
})
export class SidebarManager {
  sections = HSEMANAGER_SECTIONS;

  brand = {
    title: 'HSE',
    accent: 'Manager',
    subtitle: 'hseMonitor',
    logoSrc: 'assets/images/logo.png',
    homeLink: '/manager',
  };
}