export interface TmdbItem {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  genre_ids?: number[];
  // FIX: Added 'person' to media_type to correctly type results from the multi-search endpoint.
  media_type?: 'movie' | 'tv' | 'person';
}

export interface Media {
  id: number;
  title: string;
  poster: string;
  background: string;
  synopsis: string;
  year: string;
  rating: string;
  type: 'movie' | 'series';
  genres?: Genre[];
  recommendations?: Media[];
}

export interface Movie extends Media {
  // Movie specific properties
}

export interface Series extends Media {
  seasons: Season[];
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
  episodes?: Episode[];
}

export interface Episode {
  air_date: string;
  episode_number: number;
  id: number;
  name: string;
  overview: string;
  still_path: string | null;
}


export interface Genre {
  id: number;
  name: string;
}

// NOVO: Interface para o stream retornado pela sua API
export interface Stream {
  url: string;
  name: string;
  description: string;
  behaviorHints?: {
      proxyHeaders: {
          request: {
              [key: string]: string;
          };
      };
  };
}