import { Component, ChangeDetectionStrategy, inject, signal, computed, effect, AfterViewChecked } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl, Title } from '@angular/platform-browser';
import { TmdbService } from '../../services/tmdb.service';
import { AuthService } from '../../services/auth.service';
import { Media, Season, Episode, Stream } from '../../models/media.model';
import { MediaCardComponent } from '../shared/media-card/media-card.component';
import { LocalStorageService } from '../../services/local-storage.service';
import { NotificationService } from '../../services/notification.service';
import { HttpClient } from '@angular/common/http'; // Importar HttpClient

declare var lucide: any;

@Component({
  selector: 'app-media-detail',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, RouterLink, MediaCardComponent],
  templateUrl: './media-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MediaDetailComponent {
  route = inject(ActivatedRoute);
  tmdbService = inject(TmdbService);
  authService = inject(AuthService);
  sanitizer = inject(DomSanitizer);
  titleService = inject(Title);
  localStorageService = inject(LocalStorageService);
  notificationService = inject(NotificationService);
  http = inject(HttpClient); // Injetar HttpClient

  media = signal<Media | null>(null);
  isLoading = signal(true);
  
  activeServer = signal(1);
  selectedSeason = signal<Season | null>(null);
  selectedEpisode = signal<Episode | null>(null);
  
  server2Streams = signal<Stream[]>([]);
  selectedStream = signal<Stream | null>(null);

  playerUrl = computed<SafeResourceUrl | null>(() => {
    const mediaItem = this.media();
    if (!mediaItem) return null;

    let src = '';
    const server = this.activeServer();

    if (server === 2) {
        const stream = this.selectedStream();
        if (stream && stream.url) {
            const encodedHeaders = encodeURIComponent(JSON.stringify(stream.behaviorHints?.proxyHeaders?.request));
            src = `/api/video-proxy?videoUrl=${encodeURIComponent(stream.url)}&headers=${encodedHeaders}`;
        } else {
            return null;
        }
    } else if (server === 1) {
        if (mediaItem.type === 'movie' && mediaItem.id) {
            src = `https://superflixapi.shop/filme/${mediaItem.id}`;
        } else if (mediaItem.type === 'series' && mediaItem.id) {
            const seasonNum = this.selectedSeason()?.season_number || 1;
            const episodeNum = this.selectedEpisode()?.episode_number || 1;
            src = `https://superflixapi.shop/serie/${mediaItem.id}/${seasonNum}/${episodeNum}/`;
        }
    }
    
    return this.sanitizer.bypassSecurityTrustResourceUrl(src);
  });

  constructor() {
    this.route.paramMap.subscribe(params => {
      this.isLoading.set(true);
      const type = params.get('type') as 'movie' | 'series';
      const id = Number(params.get('id'));

      if (type && id) {
        this.tmdbService.getMediaDetails(type, id).subscribe(data => {
          this.media.set(data);
          this.titleService.setTitle(`${data.title} - CineVEO`);
          
          if (type === 'series' && (data as any).seasons?.length > 0) {
            this.selectSeason((data as any).seasons[0]);
          } else {
            this.localStorageService.saveToWatchHistory(data);
          }
          this.isLoading.set(false);
        });
      }
    });

    effect(() => {
      if(this.activeServer() === 2 && this.media() && this.server2Streams().length === 0 && !this.isLoading()) {
        this.notificationService.show('Conteúdo para este servidor não encontrado.', 'error');
      }
    });
  }
  
  ngAfterViewChecked() {
    // Código para criar ícones se necessário
  }
  
  loadEpisodes(seasonNumber: number) {
    if (!this.media()?.id || this.media()?.type !== 'series') return;
    this.tmdbService.getSeasonDetails(this.media()!.id, seasonNumber).subscribe(fullSeason => {
      this.selectedSeason.update(s => s ? {...s, episodes: fullSeason.episodes} : null);
      if (fullSeason.episodes?.length > 0) {
        this.selectEpisode(fullSeason.episodes[0]);
      }
    });
  }
  
  selectSeason(season: Season) {
    this.selectedSeason.set(season);
    this.loadEpisodes(season.season_number);
  }
  
  selectEpisode(episode: Episode) {
    this.selectedEpisode.set(episode);
    const mediaItem = this.media();
    if(mediaItem) {
        const historyItem = {
            ...mediaItem,
            season: this.selectedSeason()?.season_number,
            episode: episode.episode_number,
        };
        this.localStorageService.saveToWatchHistory(historyItem);
    }
  }

  changeServer(server: number) {
    this.activeServer.set(server);
    if (server === 2) {
        this.fetchServer2Streams();
    } else {
        this.server2Streams.set([]);
        this.selectedStream.set(null);
    }
  }

  selectStream(stream: Stream) {
    this.selectedStream.set(stream);
  }
  
  private fetchServer2Streams() {
    const mediaItem = this.media();
    if (!mediaItem) return;

    let endpoint = '';
    if (mediaItem.type === 'movie') {
        endpoint = `/api/stream/movie/${mediaItem.id}`;
    } else if (mediaItem.type === 'series' && this.selectedSeason() && this.selectedEpisode()) {
        const seasonNum = this.selectedSeason()!.season_number;
        const episodeNum = this.selectedEpisode()!.episode_number;
        endpoint = `/api/stream/series/${mediaItem.id}/${seasonNum}/${episodeNum}`;
    }

    if (endpoint) {
        this.http.get<{ streams: Stream[] }>(endpoint).subscribe({
            next: (data) => {
                if (data.streams && data.streams.length > 0) {
                    this.server2Streams.set(data.streams);
                    this.selectedStream.set(data.streams[0]); // Seleciona o primeiro stream por padrão
                } else {
                    this.server2Streams.set([]);
                    this.selectedStream.set(null);
                    this.notificationService.show('Não foi possível encontrar streams para o Servidor 2.', 'error');
                }
            },
            error: (err) => {
                console.error("Erro ao buscar streams do Servidor 2:", err);
                this.server2Streams.set([]);
                this.selectedStream.set(null);
                this.notificationService.show('Erro ao carregar os streams do Servidor 2.', 'error');
            }
        });
    }
  }
}