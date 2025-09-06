
import { Component, ChangeDetectionStrategy, inject, signal, AfterViewInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerComponent implements AfterViewInit, OnDestroy {
  route = inject(ActivatedRoute);
  sanitizer = inject(DomSanitizer);

  videoSrc = signal<SafeResourceUrl | null>(null);
  isPlaying = signal(false);
  isMuted = signal(false);
  volume = signal(1);
  currentTime = signal(0);
  duration = signal(0);
  isControlsVisible = signal(true);
  
  private controlsTimeout: any;
  
  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;
  @ViewChild('progressBar') progressBar!: ElementRef<HTMLInputElement>;
  @ViewChild('playerContainer') playerContainer!: ElementRef<HTMLDivElement>;

  constructor() {
    this.route.queryParamMap.subscribe(params => {
      const src = params.get('src');
      if (src) {
        this.videoSrc.set(this.sanitizer.bypassSecurityTrustResourceUrl(decodeURIComponent(src)));
      }
    });
  }

  ngAfterViewInit() {
    this.showControls();
    this.videoPlayer.nativeElement.play().catch(() => {
        this.isPlaying.set(false);
    });
  }

  ngOnDestroy() {
    clearTimeout(this.controlsTimeout);
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    this.showControls();
    switch (event.key) {
      case ' ': this.togglePlay(); break;
      case 'ArrowLeft': this.seekRelative(-10); break;
      case 'ArrowRight': this.seekRelative(10); break;
      case 'ArrowUp': this.setVolumeRelative(0.1); break;
      case 'ArrowDown': this.setVolumeRelative(-0.1); break;
      case 'f': this.toggleFullscreen(); break;
      case 'm': this.toggleMute(); break;
    }
  }

  // Player Controls
  togglePlay() {
    const video = this.videoPlayer.nativeElement;
    video.paused ? video.play() : video.pause();
  }
  
  seekRelative(time: number) {
      this.videoPlayer.nativeElement.currentTime += time;
  }

  setVolumeRelative(level: number) {
      this.videoPlayer.nativeElement.volume = Math.max(0, Math.min(1, this.videoPlayer.nativeElement.volume + level));
  }

  toggleMute() {
    this.videoPlayer.nativeElement.muted = !this.videoPlayer.nativeElement.muted;
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      this.playerContainer.nativeElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  onSeek() {
    const video = this.videoPlayer.nativeElement;
    video.currentTime = (Number(this.progressBar.nativeElement.value) / 100) * video.duration;
  }
  
  onVolumeChange(event: Event) {
    const volume = Number((event.target as HTMLInputElement).value);
    this.videoPlayer.nativeElement.volume = volume;
    this.videoPlayer.nativeElement.muted = volume === 0;
  }

  // Player Events
  onPlayPause() {
    this.isPlaying.set(!this.videoPlayer.nativeElement.paused);
  }
  onTimeUpdate() {
    this.currentTime.set(this.videoPlayer.nativeElement.currentTime);
    const progress = (this.currentTime() / this.duration()) * 100;
    this.progressBar.nativeElement.value = isNaN(progress) ? '0' : progress.toString();
    this.progressBar.nativeElement.style.background = `linear-gradient(to right, #FBBF24 ${progress}%, rgba(255, 255, 255, 0.3) ${progress}%)`;
  }
  onLoadedMetadata() {
    this.duration.set(this.videoPlayer.nativeElement.duration);
  }
  onVolumeChangeUpdate() {
      this.isMuted.set(this.videoPlayer.nativeElement.muted);
      this.volume.set(this.videoPlayer.nativeElement.volume);
  }

  formatTime(time: number): string {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  showControls() {
    this.isControlsVisible.set(true);
    clearTimeout(this.controlsTimeout);
    this.controlsTimeout = setTimeout(() => {
      if (this.isPlaying()) {
        this.isControlsVisible.set(false);
      }
    }, 3000);
  }
}
