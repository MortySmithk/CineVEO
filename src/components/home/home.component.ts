
import { Component, ChangeDetectionStrategy, inject, signal, AfterViewChecked } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { TmdbService } from '../../services/tmdb.service';
import { Media } from '../../models/media.model';
import { MediaCardComponent } from '../shared/media-card/media-card.component';
import { LocalStorageService } from '../../services/local-storage.service';

declare var lucide: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, MediaCardComponent],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  tmdbService = inject(TmdbService);
  localStorageService = inject(LocalStorageService);

  heroItems = signal<Media[]>([]);
  popularMovies = signal<Media[]>([]);
  popularSeries = signal<Media[]>([]);
  continueWatching = signal<Media[]>([]);

  constructor() {
    this.tmdbService.getTrending('movie').subscribe(movies => {
      this.heroItems.set(movies.slice(0, 5));
      this.popularMovies.set(movies.slice(0, 15));
    });
    this.tmdbService.getPopular('tv').subscribe(series => this.popularSeries.set(series.slice(0, 15)));
    this.continueWatching.set(this.localStorageService.getWatchHistory());
  }

  ngAfterViewChecked() {
    lucide.createIcons();
  }
}
