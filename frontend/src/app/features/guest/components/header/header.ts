import { Component, HostListener, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { catchError, of } from 'rxjs';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { AuthServices, User } from '../../../../core/services/auth/auth-services';
import { RoleRedirectServices } from '../../../../core/services/redirect/role-redirect-services';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit {
  isScrolled = signal(false);
  isMobileMenuOpen = signal(false);
  isLangMenuOpen = signal(false);
  currentUser = signal<User | null>(null);
  currentLang = signal<string>('fr');

  readonly langs = [
    { code: 'fr', label: 'Français', flag: 'FR' },
    { code: 'en', label: 'English', flag: 'EN' },
    { code: 'de', label: 'Deutsch', flag: 'DE' },
  ];

  navLinks = [
    { key: 'landing.nav.platform', anchor: 'about' },
    { key: 'landing.nav.features', anchor: 'features' },
    { key: 'landing.nav.workflow', anchor: 'workflow' },
    { key: 'landing.nav.roles', anchor: 'roles' },
    { key: 'landing.nav.pricing', anchor: 'pricing' },
  ];

  constructor(
    private authService: AuthServices,
    private roleRedirect: RoleRedirectServices,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    const saved = localStorage.getItem('lang') ?? 'fr';
    this.currentLang.set(saved);
    this.translate.use(saved);

    this.authService
      .me()
      .pipe(catchError(() => of(null)))
      .subscribe((res) => {
        this.currentUser.set(res?.user ?? null);
      });
  }

  setLang(code: string): void {
    this.currentLang.set(code);
    this.translate.use(code);
    localStorage.setItem('lang', code);
    this.isLangMenuOpen.set(false);
  }

  toggleLangMenu(): void {
    this.isLangMenuOpen.update((v) => !v);
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
