import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { fetchFromTMDB, formatTMDBData } from '../services/tmdbService';
import { MediaItem, Episode, WatchHistoryItem, FirestoreMediaData } from '../types';
import MediaCarousel from '../components/MediaCarousel';
import { useDeviceType } from '../hooks/useDeviceType';
import { ChevronDown, Star } from 'lucide-react';
import toast from 'react-hot-toast';

interface Stream {
    url: string;
    name: string;
    description: string;
    behaviorHints?: {
        proxyHeaders: {
            request: Record<string, string>;
        };
    };
}

const DetailPage: React.FC = () => {
    const { type, id, season: seasonParam, episode: episodeParam } = useParams<{ type: 'movie' | 'series', id: string, season?: string, episode?: string }>();
    const deviceType = useDeviceType();

    const [media, setMedia] = useState<MediaItem | null>(null);
    const [recommendations, setRecommendations] = useState<MediaItem[]>([]);
    const [episodes, setEpisodes] = useState<Episode[]>([]);
    const [firestoreData, setFirestoreData] = useState<FirestoreMediaData | null>(null);
    
    const [currentSeason, setCurrentSeason] = useState(Number(seasonParam) || 1);
    const [currentEpisode, setCurrentEpisode] = useState(Number(episodeParam) || 1);
    const [activeServer, setActiveServer] = useState(1);
    const [playerUrl, setPlayerUrl] = useState('');
    const [loading, setLoading] = useState(true);

    const [server2Streams, setServer2Streams] = useState<Stream[]>([]);
    const [selectedStream, setSelectedStream] = useState<Stream | null>(null);

    const loadEpisodes = useCallback(async (seasonNumber: number) => {
        if (!id || type !== 'series') return;
        const seasonDetails = await fetchFromTMDB<{ episodes: Episode[] }>(`/tv/${id}/season/${seasonNumber}`);
        if (seasonDetails?.episodes) {
            setEpisodes(seasonDetails.episodes);
            const initialEpisode = Number(episodeParam) && Number(seasonParam) === seasonNumber ? Number(episodeParam) : 1;
            setCurrentEpisode(initialEpisode);
        } else {
            setEpisodes([]);
        }
    }, [id, type, seasonParam, episodeParam]);
    
    useEffect(() => {
        const loadMedia = async () => {
            if (!id || !type) return;
            setLoading(true);

            try {
                const tmdbType = type === 'series' ? 'tv' : 'movie';
                
                // **CORREÇÃO AQUI**: Adicionado '&append_to_response=external_ids' para buscar o IMDb ID
                const appendToResponse = type === 'series' ? '&append_to_response=external_ids' : '';

                const [data, recommendationsData] = await Promise.all([
                    fetchFromTMDB<any>(`/${tmdbType}/${id}`, appendToResponse),
                    fetchFromTMDB<{ results: any[] }>(`/${tmdbType}/${id}/recommendations`)
                ]);
                
                setFirestoreData(null);

                if (data) {
                    const formattedMedia = formatTMDBData(data);
                    setMedia(formattedMedia);
                    document.title = `${formattedMedia?.title} - CineVEO`;
                    if (type === 'series') {
                        loadEpisodes(currentSeason);
                    }
                }
                if (recommendationsData) {
                    setRecommendations(recommendationsData.results.map(formatTMDBData).filter(Boolean) as MediaItem[]);
                }
            } catch (error) {
                console.error("Error loading media details:", error);
                toast.error("Não foi possível carregar os detalhes.");
            } finally {
                setLoading(false);
            }
        };
        loadMedia();
    }, [id, type, currentSeason, loadEpisodes]);

    useEffect(() => {
        if (activeServer !== 2 || !media) {
            setServer2Streams([]);
            setSelectedStream(null);
            return;
        }

        const fetchStreams = async () => {
            if (!media.imdb_id) {
                toast.error("IMDb ID não encontrado para este item.");
                setServer2Streams([]);
                setSelectedStream(null);
                return;
            }

            try {
                const endpoint = type === 'movie' 
                    ? `/api/stream/movie/${media.imdb_id}`
                    : `/api/stream/series/${media.imdb_id}/${currentSeason}/${currentEpisode}`;
                
                console.log(`Buscando streams do Servidor 2 em: ${endpoint}`);
                const streamResponse = await fetch(endpoint);
                const streamData = await streamResponse.json();

                console.log("Resposta da API de stream:", streamData);

                if (streamResponse.ok && streamData.streams && streamData.streams.length > 0) {
                    setServer2Streams(streamData.streams);
                    setSelectedStream(streamData.streams[0]); 
                } else {
                    setServer2Streams([]);
                    setSelectedStream(null);
                    toast.error("Não foi possível encontrar um stream para o Servidor 2.");
                }
            } catch (error) {
                console.error("Erro ao buscar stream do Servidor 2:", error);
                toast.error("Erro ao carregar os streams do Servidor 2.");
            }
        };

        fetchStreams();
    }, [activeServer, media, type, id, currentSeason, currentEpisode]);

    useEffect(() => {
        if (!media) return;

        let src = '';
        if (activeServer === 2 && selectedStream) {
            const encodedHeaders = encodeURIComponent(JSON.stringify(selectedStream.behaviorHints?.proxyHeaders));
            src = `/api/video-proxy?videoUrl=${encodeURIComponent(selectedStream.url)}&headers=${encodedHeaders}`;
        } else if (activeServer === 1) {
            if (type === 'movie' && id) {
                src = `https://superflixapi.shop/filme/${id}`;
            } else if (type === 'series' && id) {
                src = `https://superflixapi.shop/serie/${id}/${currentSeason}/${currentEpisode}/`;
            }
        }
        
        setPlayerUrl(src);

        const historyItem: WatchHistoryItem = { ...media, season: currentSeason, episode: currentEpisode };
        let history: WatchHistoryItem[] = JSON.parse(localStorage.getItem("watchHistory") || "[]");
        history = history.filter(item => item.id !== media.id);
        history.unshift(historyItem);
        localStorage.setItem("watchHistory", JSON.stringify(history.slice(0, 15)));

    }, [activeServer, media, type, id, currentSeason, currentEpisode, selectedStream]);


    if (loading) {
        return <div className="flex justify-center items-center h-screen"><div className="w-16 h-16 border-4 border-t-yellow-500 border-gray-800 rounded-full animate-spin"></div></div>;
    }

    if (!media) {
        return <div className="pt-24 text-center text-red-500">Mídia não encontrada.</div>;
    }
    
    const hasServer2 = true;

    const serverButtons = (
        <div className="flex gap-2 my-4">
            {[1, hasServer2 ? 2 : null].filter(Boolean).map(serverNum => (
                <button
                    key={serverNum}
                    onClick={() => setActiveServer(serverNum as number)}
                    data-tv-focusable
                    className={`flex-1 py-2 px-4 rounded-md font-bold text-sm transition-colors ${activeServer === serverNum ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                >
                    SERVIDOR {serverNum}
                </button>
            ))}
        </div>
    );
    
    const streamButtons = (
        <div className="flex gap-2 mb-4">
            {server2Streams.map((stream, index) => (
                <button
                    key={index}
                    onClick={() => setSelectedStream(stream)}
                    data-tv-focusable
                    className={`px-4 py-2 rounded-md font-bold text-sm transition-colors ${selectedStream === stream ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                >
                    {stream.description || `Opção ${index + 1}`}
                </button>
            ))}
        </div>
    );
    
    const DesktopLayout = (
        <div className="relative min-h-screen">
             <div className="absolute inset-0 z-0">
                <img src={media.background} alt="" className="w-full h-full object-cover opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-transparent"></div>
            </div>
            <div className="relative z-10 container mx-auto px-8 py-28">
                <div className="grid grid-cols-12 gap-8 mb-12">
                    <div className="col-span-3">
                        <img src={media.poster} alt={media.title} className="w-full rounded-lg shadow-2xl" />
                    </div>
                    <div className="col-span-9 flex flex-col justify-center text-white">
                        <h1 className="text-5xl font-black">{media.title}</h1>
                        <div className="flex items-center gap-4 mt-2 mb-4 text-gray-400">
                           <span>{media.year}</span>
                            {media.rating && <span><Star className="inline w-4 h-4 text-yellow-400 -mt-1 mr-1" /> {media.rating}</span>}
                            <span>{media.genres?.map(g => g.name).join(', ')}</span>
                        </div>
                        <p className="text-gray-300 max-w-3xl leading-relaxed">{media.synopsis}</p>
                    </div>
                </div>

                <div className={type === 'series' ? "grid grid-cols-12 gap-8" : ""}>
                    {type === 'series' && media.seasons && (
                        <div className="col-span-4 lg:col-span-3">
                            <div className="space-y-2 mb-4">
                                {media.seasons.filter(s => s.season_number > 0).map(s => (
                                    <button key={s.id} onClick={() => { setCurrentSeason(s.season_number); loadEpisodes(s.season_number); }} data-tv-focusable
                                        className={`w-full text-left p-3 rounded-lg font-semibold transition-colors ${currentSeason === s.season_number ? 'bg-yellow-500 text-black' : 'bg-gray-800/70 hover:bg-gray-700'}`}>
                                        {s.name}
                                    </button>
                                ))}
                            </div>
                            <div className="bg-black/30 rounded-lg p-2 max-h-[400px] overflow-y-auto space-y-1">
                                {episodes.map(ep => (
                                    <button key={ep.id} onClick={() => setCurrentEpisode(ep.episode_number)} data-tv-focusable
                                     className={`w-full text-left p-2.5 rounded text-sm transition-colors ${currentEpisode === ep.episode_number ? 'bg-yellow-500/20 text-yellow-300' : 'text-gray-300 hover:bg-white/10'}`}>
                                        EP {ep.episode_number}: {ep.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className={type === 'series' ? "col-span-8 lg:col-span-9" : "col-span-12"}>
                        <div className="bg-black rounded-lg overflow-hidden h-96 md:h-[550px]">
                           {playerUrl && <iframe title="player" src={playerUrl} allowFullScreen className="w-full h-full" frameBorder="0"></iframe>}
                        </div>
                         {type === 'series' && <h3 className="text-xl font-bold mt-3 text-white">T{currentSeason} E{currentEpisode}: {episodes.find(e => e.episode_number === currentEpisode)?.name || '...'}</h3>}
                        {serverButtons}
                        {activeServer === 2 && server2Streams.length > 0 && streamButtons}
                    </div>
                </div>
            </div>
        </div>
    );
    
    const MobileLayout = (
        <div className="pt-16">
            <div className="sticky top-[64px] z-20 bg-black h-[250px]">
                {playerUrl && <iframe title="player" src={playerUrl} allowFullScreen className="w-full h-full" frameBorder="0"></iframe>}
            </div>
            <div className="p-4">
                {serverButtons}
                 {activeServer === 2 && server2Streams.length > 0 && streamButtons}
                 {type === 'series' && media.seasons && (
                    <>
                        <div className="relative mb-2">
                             <select onChange={(e) => {setCurrentSeason(Number(e.target.value)); loadEpisodes(Number(e.target.value));}} value={currentSeason} className="w-full bg-gray-800 text-white p-3 rounded-lg font-semibold appearance-none">
                                {media.seasons.filter(s => s.season_number > 0).map(s => (
                                    <option key={s.id} value={s.season_number}>{s.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                         <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
                            {episodes.map(ep => (
                                 <button key={ep.id} onClick={() => setCurrentEpisode(ep.episode_number)}
                                    className={`flex-shrink-0 w-12 h-12 rounded-lg font-bold transition-colors ${currentEpisode === ep.episode_number ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-300'}`}>
                                    {ep.episode_number}
                                </button>
                            ))}
                        </div>
                    </>
                )}
                 <div className="mt-6">
                    <h2 className="text-xl font-bold text-white mb-2">Sinopse</h2>
                    <p className="text-gray-400 text-sm leading-relaxed">{media.synopsis}</p>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {deviceType === 'desktop' || deviceType === 'tv' ? DesktopLayout : MobileLayout}
            <div className="relative z-10 bg-black pt-8">
                <MediaCarousel title="Você também pode gostar" items={recommendations} />
            </div>
        </>
    );
};
export default DetailPage;