import { MediaItem, TmdbGenre } from '../types';
import { TMDB_API_KEY, TMDB_BASE_URL, TMDB_IMG_URL, TMDB_IMG_ORIGINAL_URL } from '../constants';

export const fetchFromTMDB = async <T,>(endpoint: string, params: string = ''): Promise<T | null> => {
    const url = `${TMDB_BASE_URL}${endpoint}?api_key=${TMDB_API_KEY}&language=pt-BR${params}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`TMDB API request failed: ${response.statusText}`);
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching from TMDB endpoint ${endpoint}:`, error);
        return null;
    }
};

export const formatTMDBData = (item: any): MediaItem | null => {
    if (!item || !item.id) return null;
    const type = item.media_type || (item.first_air_date ? 'tv' : 'movie');
    
    // **CORREÇÃO AQUI**
    // Pega o imdb_id de 'item.imdb_id' (para filmes) ou de 'item.external_ids.imdb_id' (para séries)
    const imdbId = item.imdb_id || (item.external_ids ? item.external_ids.imdb_id : undefined);

    return {
        id: item.id,
        imdb_id: imdbId, // Usa a variável corrigida
        title: item.title || item.name || 'Título Desconhecido',
        poster: item.poster_path ? `${TMDB_IMG_URL}${item.poster_path}` : 'https://placehold.co/342x513/111111/1A1A1A?text=N/A',
        background: item.backdrop_path ? `${TMDB_IMG_ORIGINAL_URL}${item.backdrop_path}` : '',
        synopsis: item.overview,
        year: (item.release_date || item.first_air_date || '').substring(0, 4),
        type: type === 'tv' ? 'series' : 'movie',
        rating: item.vote_average ? parseFloat(item.vote_average.toFixed(1)) : undefined,
        genres: item.genres,
        seasons: item.seasons,
    };
};


let genresList: TmdbGenre[] = [];
export const getGenres = async (): Promise<TmdbGenre[]> => {
    if (genresList.length > 0) {
        return genresList;
    }
    const movieGenresData = await fetchFromTMDB<{ genres: TmdbGenre[] }>('/genre/movie/list');
    const tvGenresData = await fetchFromTMDB<{ genres: TmdbGenre[] }>('/genre/tv/list');
    
    const allGenres = new Map<number, string>();
    if (movieGenresData) movieGenresData.genres.forEach(g => allGenres.set(g.id, g.name));
    if (tvGenresData) tvGenresData.genres.forEach(g => allGenres.set(g.id, g.name));
    
    genresList = Array.from(allGenres.entries()).map(([id, name]) => ({ id, name }));
    return genresList;
};