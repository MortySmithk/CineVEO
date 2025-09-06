
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { fetchFromTMDB, formatTMDBData } from '../services/tmdbService';
import { MediaItem } from '../types';
import MediaCard from '../components/MediaCard';

interface CatalogPageProps {
    type: 'movie' | 'tv' | 'search';
    title?: string;
    genreId?: string;
}

const CatalogPage: React.FC<CatalogPageProps> = ({ type, title, genreId }) => {
    const { query } = useParams<{ query?: string }>();
    const [items, setItems] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [pageTitle, setPageTitle] = useState(title || '');

    const loadItems = useCallback(async () => {
        setLoading(true);
        let data: { results: any[] } | null = null;

        if (type === 'search' && query) {
            setPageTitle(`Resultados para "${query}"`);
            document.title = `Busca: ${query} - CineVEO`;
            data = await fetchFromTMDB<{ results: any[] }>('/search/multi', `&query=${encodeURIComponent(query)}`);
        } else {
             document.title = `${pageTitle} - CineVEO`;
            const endpoint = `/discover/${type}`;
            const params = `&sort_by=popularity.desc${genreId ? `&with_genres=${genreId}` : ''}`;
            data = await fetchFromTMDB<{ results: any[] }>(endpoint, params);
        }
        
        if (data) {
            const formattedItems = data.results
                .map(formatTMDBData)
                .filter(Boolean)
                .filter(item => item && (item.type === 'movie' || item.type === 'series') && item.poster && !item.poster.includes('placehold')) as MediaItem[];
            setItems(formattedItems);
        }
        setLoading(false);
    }, [type, query, genreId, pageTitle]);

    useEffect(() => {
        loadItems();
    }, [loadItems]);

    return (
        <div className="container mx-auto px-4 md:px-8 pt-24 md:pt-32 min-h-screen">
            <h1 className="text-3xl font-bold text-white mb-8">{pageTitle}</h1>
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="w-12 h-12 border-4 border-t-yellow-500 border-gray-800 rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 md:gap-x-6 gap-y-8 md:gap-y-10">
                    {items.length > 0 ? (
                        items.map(item => <MediaCard key={`${item.id}-${item.type}`} item={item} />)
                    ) : (
                        <p className="text-gray-400 col-span-full">Nenhum item encontrado.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default CatalogPage;
