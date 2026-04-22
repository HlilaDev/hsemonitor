import { Component, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {

   isScrolled = signal(false);
  isMobileMenuOpen = signal(false);

  navLinks = [
    { label: 'Plateforme', anchor: 'about' },
    { label: 'Fonctionnalités', anchor: 'features' },
    { label: 'Workflow', anchor: 'workflow' },
    { label: 'Rôles', anchor: 'roles' },
    { label: 'Offres', anchor: 'pricing' },
  ];

  @HostListener('window:scroll')
  onScroll() {
    this.isScrolled.set(window.scrollY > 10);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
  }

  scrollTo(anchor: string) {
    document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth' });
    this.isMobileMenuOpen.set(false);
  }

}
