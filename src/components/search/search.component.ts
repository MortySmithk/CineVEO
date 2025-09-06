
import { Component, ChangeDetectionStrategy, signal, inject, effect, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MediaCardComponent } from '../shared/media-card/media-card.component';
import { TmdbService } from '../../services/tmdb.service';
import { Media } from '../../models/media.model';
import { LocalStorageService } from '../../services/local-storage.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Router } from '@angular/router';

declare var lucide: any;

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, MediaCardComponent],
  templateUrl: './search.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchComponent {
  tmdbService = inject(TmdbService);
  localStorageService = inject(LocalStorageService);
  router = inject(Router);

  searchQuery = signal('');
  private searchSubject = new Subject<string>();

  searchResults = signal<Media[]>([]);
  popularItems = signal<Media[]>([]);
  searchHistory = signal<string[]>([]);
  isLoading = signal(false);

  constructor() {
    this.searchHistory.set(this.localStorageService.getSearchHistory());
    this.tmdbService.getPopular('movie').subscribe(items => this.popularItems.set(items));
    
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.performSearch(query);
    });
  }
  
  ngAfterViewChecked() {
    lucide.createIcons();
  }

  onQueryChange(query: string) {
    this.searchQuery.set(query);
    this.searchSubject.next(query);
  }

  performSearch(query: string) {
    if (!query || query.length < 2) {
      this.searchResults.set([]);
      this.isLoading.set(false);
      return;
    }
    this.isLoading.set(true);
    this.tmdbService.discover('movie', undefined, query).subscribe(results => {
      this.searchResults.set(results);
      this.isLoading.set(false);
    });
  }

  submitSearch(query: string) {
    if(!query) return;
    this.localStorageService.saveToSearchHistory(query);
    this.router.navigate(['/busca', query]);
  }

  searchFromHistory(query: string) {
    this.onQueryChange(query);
    this.submitSearch(query);
  }
  
  removeFromHistory(query: string) {
      this.localStorageService.removeFromSearchHistory(query);
      this.searchHistory.set(this.localStorageService.getSearchHistory());
  }
}
