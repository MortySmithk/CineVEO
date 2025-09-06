import { Component, ChangeDetectionStrategy, inject, signal, ViewChild, ElementRef, effect, AfterViewChecked } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AuthService } from './services/auth.service';
import { DeviceService, DeviceType } from './services/device.service';
import { NotificationService } from './services/notification.service';
import { TmdbService } from './services/tmdb.service';
import { User } from 'firebase/auth';
import { AuthModalComponent } from './components/auth-modal/auth-modal.component';

declare var lucide: any;

interface Genre {
  id: number;
  name: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, FormsModule, NgOptimizedImage, AuthModalComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  authService = inject(AuthService);
  deviceService = inject(DeviceService);
  notificationService = inject(NotificationService);
  tmdbService = inject(TmdbService);
  router = inject(Router);
  
  currentUser = this.authService.currentUser;
  isAdmin = this.authService.isAdmin;
  isPremium = this.authService.isPremium;
  deviceType = this.deviceService.deviceType;
  notifications = this.notificationService.notifications;
  
  genres = signal<Genre[]>([]);
  searchQuery = signal('');
  
  isAuthModalOpen = signal(false);

  constructor() {
    this.tmdbService.getGenres().subscribe(genres => this.genres.set(genres));

    effect(() => {
      if(this.currentUser()) {
        this.isAuthModalOpen.set(false);
      }
    });

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // Close sidebar on navigation for mobile
        if (this.deviceType() === 'mobile') {
          // Add logic if a mobile sidebar is implemented
        }
      }
    });
  }

  ngAfterViewChecked() {
    lucide.createIcons();
  }
  
  onSearch() {
    const query = this.searchQuery().trim();
    if (query) {
      this.router.navigate(['/busca', query]);
      this.searchQuery.set('');
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
  
  closeNotification(id: number) {
    this.notificationService.removeNotification(id);
  }
}
