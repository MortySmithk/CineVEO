import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { Genre, Media, TmdbItem, Season } from '../models/media.model';

@Injectable({
  providedIn: 'root'
})
export class TmdbService {
  private http = inject(HttpClient);
  
  private readonly API_KEY = '678cf2db5c3ab4a315d8ec632c493c7d';
  private readonly BASE_URL = 'https://api.themoviedb.org/3';
  private readonly IMG_URL = 'https://image.tmdb.org/t/p/w500';
  private readonly IMG_ORIGINAL_URL = 'https://image.tmdb.org/t/p/original';

  private genresCache: Genre[] | null = null;

  private formatMedia(item: TmdbItem): Media {
    // FIX: Correctly map TMDB's 'tv' media_type to our internal 'series' type to avoid type mismatch.
    const tmdbType = item.media_type || (item.first_air_date ? 'tv' : 'movie');
    const type = tmdbType === 'tv' ? 'series' : 'movie';
    return {
      id: item.id,
      title: (item as any).title || (item as any).name,
      poster: item.poster_path ? `${this.IMG_URL}${item.poster_path}` : 'https://placehold.co/500x750/111111/1A1A1A?text=N/A',
      background: item.backdrop_path ? `${this.IMG_ORIGINAL_URL}${item.backdrop_path}` : '',
      synopsis: item.overview,
      year: (item.release_date || item.first_air_date || '').substring(0, 4),
      type: type,
      rating: item.vote_average ? item.vote_average.toFixed(1) : 'N/A',
    };
  }

  private fetch<T>(endpoint: string, params: string = ''): Observable<T> {
    const url = `${this.BASE_URL}${endpoint}?api_key=${this.API_KEY}&language=pt-BR${params}`;
    return this.http.get<T>(url);
  }

  // FIX: Add missing getGenres method.
  getGenres(): Observable<Genre[]> {
    if (this.genresCache) {
      return of(this.genresCache);
    }
    // FIX: Add explicit type for `response` to resolve property access error.
    return this.fetch<{ genres: Genre[] }>('/genre/movie/list').pipe(
      map((response: { genres: Genre[] }) => {
        this.genresCache = response.genres;
        return response.genres;
      })
    );
  }

  getTrending(type: 'movie' | 'tv', period: 'day' | 'week' = 'week'): Observable<Media[]> {
    return this.fetch<{results: TmdbItem[]}>(`/trending/${type}/${period}`).pipe(
      // FIX: Add explicit type for `data` to resolve property access error.
      map((data: { results: TmdbItem[] }) => data.results.map(item => this.formatMedia(item)))
    );
  }
  
  getPopular(type: 'movie' | 'tv'): Observable<Media[]> {
    return this.fetch<{results: TmdbItem[]}>(`/${type}/popular`).pipe(
      // FIX: Add explicit type for `data` to resolve property access error.
      map((data: { results: TmdbItem[] }) => data.results.map(item => this.formatMedia(item)))
    );
  }

  getMediaDetails(type: 'movie' | 'series', id: number): Observable<Media> {
    const tmdbType = type === 'series' ? 'tv' : 'movie';
    return this.fetch<any>(`/${tmdbType}/${id}`).pipe(
      // FIX: Add explicit type `any` for `data` to resolve property access and assignment errors.
      map((data: any) => ({
        ...this.formatMedia(data),
        genres: data.genres,
        seasons: data.seasons // For series
      }))
    );
  }
  
  getRecommendations(type: 'movie' | 'series', id: number): Observable<Media[]> {
     const tmdbType = type === 'series' ? 'tv' : 'movie';
    return this.fetch<{results: TmdbItem[]}>(`/${tmdbType}/${id}/recommendations`).pipe(
      // FIX: Add explicit type for `data` to resolve property access error.
      map((data: { results: TmdbItem[] }) => data.results.slice(0, 12).map(item => this.formatMedia(item)))
    );
  }

  // FIX: Add missing getSeasonDetails method.
  getSeasonDetails(tvId: number, seasonNumber: number): Observable<Season> {
    return this.fetch<Season>(`/tv/${tvId}/season/${seasonNumber}`);
  }

  discover(type: 'movie' | 'tv', genreId?: number, query?: string): Observable<Media[]> {
    let params = '&sort_by=popularity.desc';
    if (genreId) {
      params += `&with_genres=${genreId}`;
    }
    const endpoint = query ? `/search/multi` : `/discover/${type}`;
    if (query) {
      params += `&query=${encodeURIComponent(query)}`;
    }
    
    return this.fetch<{results: TmdbItem[]}>(endpoint, params).pipe(
      // FIX: Add explicit type for `data` and complete the mapping logic to handle and filter search results.
      map((data: { results: TmdbItem[] }) => 
        data.results
          .filter(item => item.media_type !== 'person')
          .map(item => this.formatMedia(item))
      )
    );
  }
}