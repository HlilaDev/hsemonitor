import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Output,
  inject,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NotificationStore } from '../../../../core/store/notification.store';

@Component({
  selector: 'app-header-supervisor',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './header-supervisor.html',
  styleUrl: './header-supervisor.scss',
})
export class HeaderSupervisor {
  @Output() toggleSidebar = new EventEmitter<void>();

  readonly notificationStore = inject(NotificationStore);
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  isNotificationOpen = false;
  isLangOpen = false;
  isUserOpen = false;

  currentLang = 'EN';

  avatarUrl = 'assets/images/default-avatar.png';
  displayName = 'Supervisor User';
  displayRole = 'SUPERVISOR';

  lang = {
    options: [
      { code: 'FR', label: 'Français', flag: 'assets/flags/fr.png' },
      { code: 'EN', label: 'English', flag: 'assets/flags/en.png' },
      { code: 'DE', label: 'Deutsch', flag: 'assets/flags/de.png' },
    ],
    flagByCode: {
      FR: 'assets/flags/fr.png',
      EN: 'assets/flags/en.png',
      DE: 'assets/flags/de.png',
    } as Record<string, string>,
  };

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  toggleNotificationMenu(event: Event): void {
    event.stopPropagation();
    this.isNotificationOpen = !this.isNotificationOpen;
    this.isLangOpen = false;
    this.isUserOpen = false;
  }

  toggleLangMenu(event: Event): void {
    event.stopPropagation();
    this.isLangOpen = !this.isLangOpen;
    this.isNotificationOpen = false;
    this.isUserOpen = false;
  }

  toggleUserMenu(event: Event): void {
    event.stopPropagation();
    this.isUserOpen = !this.isUserOpen;
    this.isLangOpen = false;
    this.isNotificationOpen = false;
  }

  closeUserMenu(): void {
    this.isUserOpen = false;
  }

  chooseLang(code: string): void {
    this.currentLang = code;
    this.translate.use(code.toLowerCase());
    this.isLangOpen = false;
  }

  markAllNotificationsRead(): void {
    this.notificationStore.markAllAsRead();
  }

  openNotification(item: any): void {
    if (!item?.isRead) {
      this.notificationStore.markAsRead(item._id);
    }
    this.isNotificationOpen = false;
    this.router.navigate(['/supervisor/notifications']);
  }

  openNotificationsPage(): void {
    this.isNotificationOpen = false;
    this.router.navigate(['/supervisor/notifications']);
  }

  trackByAlert(index: number, item: any): string {
    return item?._id || String(index);
  }

  logout(): void {
    this.closeUserMenu();
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as Node;
    if (!this.el.nativeElement.contains(target)) {
      this.isNotificationOpen = false;
      this.isLangOpen = false;
      this.isUserOpen = false;
    }
  }
}