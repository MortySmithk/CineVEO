
import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TmdbService } from '../../services/tmdb.service';
import { Media } from '../../models/media.model';
import { MediaCardComponent } from '../shared/media-card/media-card.component';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, MediaCardComponent],
  templateUrl: './catalog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogComponent {
  route = inject(ActivatedRoute);
  tmdbService = inject(TmdbService);
  titleService = inject(Title);

  items = signal<Media[]>([]);
  isLoading = signal(true);
  pageTitle = signal('');

  constructor() {
    this.route.paramMap.subscribe(params => {
      this.isLoading.set(true);
      const data = this.route.snapshot.data;
      const genreId = params.get('id');
      const genreName = params.get('name');
      const query = params.get('query');

      if (query) {
        this.pageTitle.set(`Resultados para "${query}"`);
        this.titleService.setTitle(`Busca: ${query} - CineVEO`);
        this.tmdbService.discover('movie', undefined, query).subscribe(results => {
          this.items.set(results);
          this.isLoading.set(false);
        });
      } else if (genreId) {
        const cleanGenreName = genreName ? decodeURIComponent(genreName).replace(/-/g, ' ') : 'Gênero';
        this.pageTitle.set(`Gênero: ${cleanGenreName}`);
        this.titleService.setTitle(`Gênero: ${cleanGenreName} - CineVEO`);
        const type = this.route.snapshot.url[0].path === 'series' ? 'tv' : 'movie';
        this.tmdbService.discover(type, +genreId).subscribe(results => {
          this.items.set(results);
          this.isLoading.set(false);
        });
      } else {
        this.pageTitle.set(data['title']);
        this.tmdbService.discover(data['type'], data['genreId']).subscribe(results => {
          this.items.set(results);
          this.isLoading.set(false);
        });
      }
    });
  }
}
