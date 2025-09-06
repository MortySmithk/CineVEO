
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getGenres } from '../services/tmdbService';
import { fetchFromTMDB, formatTMDBData } from '../services/tmdbService';
import { MediaItem } from '../types';
import MediaCard from '../components/MediaCard';

const GenrePage: React.FC = () => {
    const { id, name } = useParams<{ id: string; name: string }>();
    const [items, setItems] = useState<MediaItem[]>([]);
    const [genreName, setGenreName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadGenreData = async () => {
            if (!id) return;
            setLoading(true);
            
            let currentGenreName = decodeURIComponent(name || '').replace(/-/g, ' ');

            if (!name) {
                const genres = await getGenres();
                const foundGenre = genres.find(g => g.id === Number(id));
                if (foundGenre) {
                    currentGenreName = foundGenre.name;
                }
            }

            setGenreName(currentGenreName);
            document.title = `Gênero: ${currentGenreName} - CineVEO`;

            const [movieData, tvData] = await Promise.all([
                fetchFromTMDB<{ results: any[] }>('/discover/movie', `&with_genres=${id}&sort_by=popularity.desc`),
                fetchFromTMDB<{ results: any[] }>('/discover/tv', `&with_genres=${id}&sort_by=popularity.desc`)
            ]);

            const allItems = [
                ...(movieData?.results || []),
                ...(tvData?.results || [])
            ]
            .sort((a, b) => b.popularity - a.popularity)
            .map(formatTMDBData)
            .filter(Boolean) as MediaItem[];
            
            setItems(allItems);
            setLoading(false);
        };

        loadGenreData();
    }, [id, name]);

    return (
         <div className="container mx-auto px-4 md:px-8 pt-24 md:pt-32 min-h-screen">
            <h1 className="text-3xl font-bold text-white mb-8 capitalize">
                Gênero: {genreName}
            </h1>
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="w-12 h-12 border-4 border-t-yellow-500 border-gray-800 rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 md:gap-x-6 gap-y-8 md:gap-y-10">
                    {items.length > 0 ? (
                        items.map(item => <MediaCard key={`${item.id}-${item.type}`} item={item} />)
                    ) : (
                        <p className="text-gray-400 col-span-full">Nenhum item encontrado para este gênero.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default GenrePage;
