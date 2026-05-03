import { Component, HostListener, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { catchError, of } from 'rxjs';

import { AuthServices, User } from '../../../../core/services/auth/auth-services';
import { RoleRedirectServices } from '../../../../core/services/redirect/role-redirect-services';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit {
  isScrolled = signal(false);
  isMobileMenuOpen = signal(false);
  currentUser = signal<User | null>(null);

  navLinks = [
    { label: 'Plateforme', anchor: 'about' },
    { label: 'Fonctionnalités', anchor: 'features' },
    { label: 'Workflow', anchor: 'workflow' },
    { label: 'Rôles', anchor: 'roles' },
    { label: 'Offres', anchor: 'pricing' },
  ];

  constructor(
    private authService: AuthServices,
    private roleRedirect: RoleRedirectServices
  ) {}

  ngOnInit(): void {
    this.authService
      .me()
      .pipe(catchError(() => of(null)))
      .subscribe((res) => {
        this.currentUser.set(res?.user ?? null);
      });
  }

  isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }

  goToPlatform(): void {
    this.roleRedirect.redirectByRole(this.currentUser());
    this.isMobileMenuOpen.set(false);
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled.set(window.scrollY > 10);
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((v) => !v);
  }

  scrollTo(anchor: string): void {
    document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth' });
    this.isMobileMenuOpen.set(false);
  }
}