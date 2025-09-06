import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { AuthService, UserProfile } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminComponent {
  authService = inject(AuthService);
  notificationService = inject(NotificationService);
  router = inject(Router);
  // FIX: Explicitly type FormBuilder to resolve potential type inference issues.
  fb: FormBuilder = inject(FormBuilder);
  
  verifiedUser = signal<UserProfile | null>(null);
  isVerifying = signal(false);

  form = this.fb.group({
    uid: [''],
    expiryDays: [30]
  });

  constructor() {
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/']);
    }
  }

  async verifyUid() {
    const uid = this.form.get('uid')?.value;
    if (!uid) {
      this.notificationService.show('Por favor, insira um UID.', 'error');
      return;
    }
    this.isVerifying.set(true);
    this.verifiedUser.set(null);
    try {
      const userProfile = await this.authService.fetchUserProfile(uid);
      if (userProfile) {
        this.verifiedUser.set(userProfile);
        this.notificationService.show('Usuário encontrado!', 'success');
      } else {
        this.notificationService.show('Usuário com este UID não encontrado.', 'error');
      }
    } catch(e) {
      this.notificationService.show('Erro ao verificar UID.', 'error');
    } finally {
      this.isVerifying.set(false);
    }
  }

  async grantPremium(plan: 'premium' | 'lifetime') {
    const uid = this.verifiedUser()?.uid;
    const expiryDays = this.form.get('expiryDays')?.value;
    if (!uid) return;
    
    try {
      await this.authService.grantPremium(uid, plan, expiryDays!);
      this.notificationService.show(`Plano ${plan} concedido com sucesso!`, 'success');
      this.verifiedUser.set(null);
      this.form.reset({uid: '', expiryDays: 30});
    } catch(e) {
      this.notificationService.show('Erro ao conceder o plano.', 'error');
    }
  }
}
