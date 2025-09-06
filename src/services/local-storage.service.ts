
import { Injectable } from '@angular/core';
import { Media } from '../models/media.model';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  private readonly WATCH_HISTORY_KEY = 'watchHistory';
  private readonly SEARCH_HISTORY_KEY = 'searchHistory';

  getWatchHistory(): Media[] {
    const historyJson = localStorage.getItem(this.WATCH_HISTORY_KEY);
    return historyJson ? JSON.parse(historyJson) : [];
  }

  saveToWatchHistory(mediaData: Media) {
    let history = this.getWatchHistory();
    history = history.filter(item => item.id !== mediaData.id);
    history.unshift(mediaData);
    history = history.slice(0, 15);
    localStorage.setItem(this.WATCH_HISTORY_KEY, JSON.stringify(history));
  }

  getSearchHistory(): string[] {
    const historyJson = localStorage.getItem(this.SEARCH_HISTORY_KEY);
    return historyJson ? JSON.parse(historyJson) : [];
  }

  saveToSearchHistory(query: string) {
    let history = this.getSearchHistory();
    history = history.filter(item => item.toLowerCase() !== query.toLowerCase());
    history.unshift(query);
    history = history.slice(0, 10);
    localStorage.setItem(this.SEARCH_HISTORY_KEY, JSON.stringify(history));
  }
  
  removeFromSearchHistory(query: string) {
    let history = this.getSearchHistory();
    history = history.filter(q => q !== query);
    localStorage.setItem(this.SEARCH_HISTORY_KEY, JSON.stringify(history));
  }
}
