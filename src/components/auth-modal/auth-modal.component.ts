import { Component, ChangeDetectionStrategy, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthModalComponent {
  closeModal = output<void>();
  authService = inject(AuthService);
  // FIX: Explicitly type FormBuilder to resolve potential type inference issues.
  fb: FormBuilder = inject(FormBuilder);
  
  view = 'login'; // 'login', 'register', 'forgot'

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  registerForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });
  
  forgotForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  async onGoogleLogin() {
    await this.authService.googleLogin();
  }

  async onLogin() {
    if (this.loginForm.invalid) return;
    const { email, password } = this.loginForm.value;
    await this.authService.loginWithEmail(email!, password!);
  }

  async onRegister() {
    if (this.registerForm.invalid) return;
    const { name, email, password } = this.registerForm.value;
    await this.authService.registerWithEmail(name!, email!, password!);
  }
  
  async onForgotPassword() {
      if (this.forgotForm.invalid) return;
      const { email } = this.forgotForm.value;
      await this.authService.resetPassword(email!);
      this.view = 'login';
  }

  setView(newView: string) {
    this.view = newView;
  }
}
