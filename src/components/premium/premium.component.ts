
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-premium',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './premium.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PremiumComponent {
  authService = inject(AuthService);
  notificationService = inject(NotificationService);
  router = inject(Router);

  currentUser = this.authService.currentUser;
  userProfile = this.authService.userProfile;
  isPremium = this.authService.isPremium;
  
  constructor() {
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
    if (urlParams.get('status') === 'approved') {
        this.notificationService.show('Assinatura completa com sucesso! Bem-vindo ao Premium!', 'success');
        this.router.navigate(['/premium']);
    }
  }

  subscribe() {
    if (!this.currentUser()) {
      this.notificationService.show('Você precisa estar logado para assinar.', 'info');
      // In a real app, you would open the auth modal. Here we redirect.
      this.router.navigate(['/']); 
      return;
    }
    const checkoutUrl = 'https://pay.kirvano.com/9e8c418e-7359-41ec-978a-b652d5be04d8';
    window.open(checkoutUrl, '_blank');
  }
}
