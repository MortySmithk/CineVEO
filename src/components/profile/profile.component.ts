import { Component, ChangeDetectionStrategy, inject, signal, ElementRef, ViewChild, AfterViewInit, OnDestroy, AfterViewChecked, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { Router } from '@angular/router';

declare var Cropper: any;
declare var lucide: any;

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent implements AfterViewInit, OnDestroy {
  authService = inject(AuthService);
  notificationService = inject(NotificationService);
  // FIX: Explicitly type FormBuilder to resolve potential type inference issues.
  fb: FormBuilder = inject(FormBuilder);
  router = inject(Router);

  currentUser = this.authService.currentUser;
  userProfile = this.authService.userProfile;
  isPremium = this.authService.isPremium;
  isAdmin = this.authService.isAdmin;

  isEditing = signal(false);
  isSaving = signal(false);
  isCropperModalOpen = signal(false);
  
  profileForm = this.fb.group({
    displayName: ['', Validators.required],
    username: [''],
  });

  @ViewChild('cropperImage') cropperImage!: ElementRef<HTMLImageElement>;
  private cropper: any;
  private readonly IMGBB_API_KEY = '497da48eaf4aaa87f1f0b659ed76a605';

  constructor() {
    if (!this.currentUser()) {
      this.router.navigate(['/']);
      return;
    }
    // FIX: Use an effect to react to changes in the userProfile signal instead of trying to subscribe to it.
    effect(() => {
      const profile = this.userProfile();
      if (profile) {
        this.profileForm.patchValue({
          displayName: profile.displayName,
          username: profile.username?.replace('@', '')
        });
      }
    });
  }

  ngAfterViewInit() {
    lucide.createIcons();
  }
  
  ngAfterViewChecked() {
    lucide.createIcons();
  }

  ngOnDestroy() {
    if (this.cropper) {
      this.cropper.destroy();
    }
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.isCropperModalOpen.set(true);
        setTimeout(() => {
          this.cropperImage.nativeElement.src = e.target.result;
          if (this.cropper) this.cropper.destroy();
          this.cropper = new Cropper(this.cropperImage.nativeElement, {
            aspectRatio: 1,
            viewMode: 1,
            background: false,
            autoCropArea: 1,
          });
        });
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  async confirmCrop() {
    if (!this.cropper) return;
    this.isSaving.set(true);
    const base64Image = this.cropper.getCroppedCanvas({ width: 256, height: 256 }).toDataURL('image/jpeg');
    const formData = new FormData();
    formData.append('key', this.IMGBB_API_KEY);
    formData.append('image', base64Image.split(',')[1]);

    try {
      const response = await fetch('https://api.imgbb.com/1/upload', { method: 'POST', body: formData });
      const result = await response.json();
      if (!result.success) throw new Error(result.error?.message || 'Falha no upload.');
      
      const newPhotoURL = result.data.url;
      await this.authService.updateUserProfile(this.currentUser()!.uid, { photoURL: newPhotoURL });
      this.notificationService.show('Foto de perfil atualizada!', 'success');
    } catch(error: any) {
      this.notificationService.show(`Erro no upload: ${error.message}`, 'error');
    } finally {
      this.isCropperModalOpen.set(false);
      this.isSaving.set(false);
    }
  }

  async saveProfile() {
    if (this.profileForm.invalid) return;
    this.isSaving.set(true);
    const { displayName, username } = this.profileForm.value;

    try {
        if(username) {
            const isTaken = await this.authService.isUsernameTaken(username, this.currentUser()!.uid);
            if(isTaken) {
                this.notificationService.show('Este nome de usuário já está em uso.', 'error');
                this.isSaving.set(false);
                return;
            }
        }
        await this.authService.updateUserProfile(this.currentUser()!.uid, { displayName: displayName!, username: username! });
    } catch (error: any) {
        this.notificationService.show(`Erro: ${error.message}`, 'error');
    } finally {
        this.isSaving.set(false);
        this.isEditing.set(false);
    }
  }
  
  resetPassword() {
      if(this.currentUser()?.email) {
          this.authService.resetPassword(this.currentUser()!.email!);
      }
  }
}
