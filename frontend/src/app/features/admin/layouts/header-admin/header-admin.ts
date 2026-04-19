

import { Component, ElementRef, HostListener, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { LanguageService, Lang } from '../../../../core/services/languages/language';
import { LayoutService } from '../../../../core/services/layout/layout';
import { AuthServices, User } from '../../../../core/services/auth/auth-services';
import { NotificationStore } from '../../../../core/services/notifications/notification-store';
import { NotificationItem } from '../../../../core/services/notifications/notification-services';

@Component({
  selector: 'app-header-admin',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterLink],
  templateUrl: './header-admin.html',
  styleUrl: './header-admin.scss',
})
export class HeaderAdmin implements OnInit {
  notificationStore = inject(NotificationStore);
  layout = inject(LayoutService);
  lang = inject(LanguageService);
  private el = inject(ElementRef<HTMLElement>);

  isLangOpen = false;
  isUserOpen = false;
  isNotificationOpen = false;

  user: User | null = null;
  isLoadingMe = false;

  constructor(
    private authservices: AuthServices,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMe();
    this.notificationStore.init();
  }

  private loadMe(): void {
    this.isLoadingMe = true;

    this.authservices.me().subscribe({
      next: (res: any) => {
        this.user = res?.user ?? null;
        this.isLoadingMe = false;
      },
      error: () => {
        this.user = null;
        this.isLoadingMe = false;
        this.router.navigate(['/login']);
      },
    });
  }

  get currentLang(): Lang {
    return this.lang.current;
  }

  toggleLangMenu(ev?: MouseEvent): void {
    ev?.stopPropagation();
    this.isLangOpen = !this.isLangOpen;

    if (this.isLangOpen) {
      this.isUserOpen = false;
      this.isNotificationOpen = false;
    }
  }

  chooseLang(code: Lang): void {
    this.lang.setLang(code);
    this.isLangOpen = false;
  }

  toggleUserMenu(ev?: MouseEvent): void {
    ev?.stopPropagation();
    this.isUserOpen = !this.isUserOpen;

    if (this.isUserOpen) {
      this.isLangOpen = false;
      this.isNotificationOpen = false;
    }
  }

  closeUserMenu(): void {
    this.isUserOpen = false;
  }

  toggleNotificationMenu(ev?: MouseEvent): void {
    ev?.stopPropagation();
    this.isNotificationOpen = !this.isNotificationOpen;

    if (this.isNotificationOpen) {
      this.isLangOpen = false;
      this.isUserOpen = false;
    }
  }

  markAllNotificationsRead(): void {
    this.notificationStore.markAllAsRead();
  }

  openNotification(id?: string): void {
    if (!id) return;
    this.notificationStore.markAsRead(id);
  }

  openNotificationsPage(): void {
    this.isNotificationOpen = false;
    this.router.navigate(['/admin/notifications']);
  }

  trackByAlert(index: number, item: NotificationItem): string {
    return item._id;
  }

  logout(): void {
    this.authservices.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login']),
    });
  }

  onToggleSidebar(): void {
    this.layout.toggleSidebar();
  }

  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent): void {
    const target = ev.target as Node;
    if (!this.el.nativeElement.contains(target)) {
      this.isLangOpen = false;
      this.isUserOpen = false;
      this.isNotificationOpen = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    this.isLangOpen = false;
    this.isUserOpen = false;
    this.isNotificationOpen = false;
  }

  get displayName(): string {
    return this.user?.fullName || '—';
  }

  get displayRole(): string {
    return this.user?.role || '';
  }

  get avatarUrl(): string {
    return 'assets/images/profile-pic.webp';
  }
}