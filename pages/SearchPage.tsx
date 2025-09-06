
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, Delete } from 'lucide-react';
import { fetchFromTMDB, formatTMDBData } from '../services/tmdbService';
import { MediaItem } from '../types';
import MediaCard from '../components/MediaCard';
import { useDeviceType } from '../hooks/useDeviceType';

const SearchPage: React.FC = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('Populares no momento');
    const deviceType = useDeviceType();
    const navigate = useNavigate();
    
    const performSearch = useCallback(async (searchQuery: string) => {
        if (searchQuery.length < 2) {
            setTitle('Populares no momento');
            const data = await fetchFromTMDB<{ results: any[] }>('/trending/all/week');
            setResults(data?.results.map(formatTMDBData).filter(Boolean) as MediaItem[] || []);
            return;
        }
        setLoading(true);
        setTitle(`Resultados para "${searchQuery}"`);
        const data = await fetchFromTMDB<{ results: any[] }>('/search/multi', `&query=${encodeURIComponent(searchQuery)}`);
        setResults(data?.results.map(formatTMDBData).filter(item => item && (item.type === 'movie' || item.type === 'series')).filter(Boolean) as MediaItem[] || []);
        setLoading(false);
    }, []);

    useEffect(() => {
        const handler = setTimeout(() => {
            performSearch(query);
        }, 400);
        return () => clearTimeout(handler);
    }, [query, performSearch]);

    const handleKeyClick = (key: string) => {
        setQuery(prev => {
            if (key === 'backspace') return prev.slice(0, -1);
            if (key === 'space') return prev + ' ';
            if (key === 'clear') return '';
            return prev + key;
        });
    };
    
    const keyboardLayout = [
        '1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
        'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p',
        'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l',
        'z', 'x', 'c', 'v', 'b', 'n', 'm',
        'backspace', 'space', 'clear'
    ];

    if (deviceType === 'tv') {
        return (
            <div className="flex h-full gap-8">
                <div className="w-1/2 flex flex-col">
                    <div className="flex items-center gap-4 bg-gray-900 p-4 rounded-lg border-2 border-gray-700">
                        <SearchIcon className="w-8 h-8 text-gray-400" />
                        <div className="flex-grow text-2xl min-h-[3rem] flex items-center">{query || '...'}</div>
                    </div>
                    <div className="grid grid-cols-10 gap-2 mt-4">
                        {keyboardLayout.map(key => {
                            if (key === 'backspace' || key === 'clear' || key === 'space') return null;
                            return <button key={key} onClick={() => handleKeyClick(key)} data-tv-focusable className="bg-gray-800 p-4 rounded-md text-xl font-bold hover:bg-yellow-500 hover:text-black transition-colors focus:outline-none">{key.toUpperCase()}</button>
                        })}
                    </div>
                     <div className="grid grid-cols-3 gap-2 mt-2">
                        <button onClick={() => handleKeyClick('space')} data-tv-focusable className="col-span-1 bg-gray-700 p-4 rounded-md text-xl font-bold hover:bg-yellow-500 hover:text-black transition-colors focus:outline-none">Espaço</button>
                        <button onClick={() => handleKeyClick('backspace')} data-tv-focusable className="bg-gray-700 p-4 rounded-md text-xl font-bold hover:bg-yellow-500 hover:text-black transition-colors focus:outline-none flex justify-center items-center"><Delete /></button>
                        <button onClick={() => handleKeyClick('clear')} data-tv-focusable className="bg-gray-700 p-4 rounded-md text-xl font-bold hover:bg-yellow-500 hover:text-black transition-colors focus:outline-none">Limpar</button>
                     </div>
                </div>
                <div className="w-1/2 flex flex-col">
                    <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
                    <div className="flex-grow overflow-y-auto pr-2 grid grid-cols-3 gap-6">
                        {loading ? <p>Buscando...</p> : results.map(item => <MediaCard item={item} key={item.id} />)}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 md:px-8 pt-24 md:pt-32 min-h-screen">
             <div className="max-w-3xl mx-auto mb-12">
                <h1 className="text-4xl font-bold text-center text-white mb-2">Encontre o que assistir</h1>
                <p className="text-gray-400 text-center mb-6">Busque por filmes, séries e muito mais.</p>
                <div className="relative">
                    <input
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Ex: O Poderoso Chefão, The Office..."
                        className="w-full p-4 pl-12 text-lg bg-gray-900 border-2 border-gray-700 rounded-full focus:ring-yellow-500 focus:border-yellow-500 transition-colors text-white"
                    />
                    <div className="absolute top-1/2 left-4 -translate-y-1/2 pointer-events-none">
                        <SearchIcon className="w-6 h-6 text-gray-400" />
                    </div>
                </div>
            </div>
            <div>
                <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 md:gap-x-6 gap-y-8 md:gap-y-10">
                    {loading ? (
                         <div className="col-span-full flex justify-center p-8">
                             <div className="w-12 h-12 border-4 border-t-yellow-500 border-gray-800 rounded-full animate-spin"></div>
                         </div>
                    ) : (
                        results.map(item => <MediaCard key={`${item.id}-${item.type}`} item={item} />)
                    )}
                 </div>
            </div>
        </div>
    );
};

export default SearchPage;
