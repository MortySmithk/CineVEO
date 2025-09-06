export interface MediaItem {
    id: number; // Este é o TMDB ID
    imdb_id?: string; // Adicione esta linha para o IMDb ID
    title: string;
    poster: string;
    background?: string;
    synopsis?: string;
    year: string;
    type: 'movie' | 'series';
    rating?: number;
    genres?: { id: number; name: string }[];
    seasons?: Season[];
    resumeLink?: string;
}

export interface Season {
    air_date: string;
    episode_count: number;
    id: number;
    name: string;
    overview: string;
    poster_path: string;
    season_number: number;
    vote_average: number;
}

export interface Episode {
    id: number;
    name: string;
    overview: string;
    episode_number: number;
    still_path: string | null;
}

export interface TmdbGenre {
    id: number;
    name: string;
}

export interface WatchHistoryItem extends MediaItem {
    season?: number;
    episode?: number;
}

export interface FirestoreMediaData {
    type: 'movie' | 'series';
    urls?: { url: string; quality: string }[];
    seasons?: {
        [seasonNumber: string]: {
            episodes: {
                urls: { url: string; quality: string }[];
            }[];
        };
    };
}