import React, { useState, useEffect } from 'react';
import { fetchFromTMDB, formatTMDBData } from '../services/tmdbService';
import { MediaItem } from '../types';
import Hero from '../components/Hero';
import MediaCarousel from '../components/MediaCarousel';

const HomePage: React.FC = () => {
    const [heroItem, setHeroItem] = useState<MediaItem | null>(null);
    const [popularMovies, setPopularMovies] = useState<MediaItem[]>([]);
    const [popularSeries, setPopularSeries] = useState<MediaItem[]>([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                // Hero Item
                const trendingMoviesData = await fetchFromTMDB<{ results: any[] }>('/trending/movie/week');
                if (trendingMoviesData && trendingMoviesData.results.length > 0) {
                    const bestResult = trendingMoviesData.results.find(m => m.backdrop_path) || trendingMoviesData.results[0];
                    const detailedData = await fetchFromTMDB<any>(`/movie/${bestResult.id}`);
                    if (detailedData) {
                        setHeroItem(formatTMDBData(detailedData));
                    }
                }

                // Popular Movies Carousel
                const moviesData = await fetchFromTMDB<{ results: any[] }>('/movie/popular');
                if (moviesData) {
                    setPopularMovies(moviesData.results.map(formatTMDBData).filter(Boolean) as MediaItem[]);
                }

                // Popular Series Carousel
                const seriesData = await fetchFromTMDB<{ results: any[] }>('/tv/popular');
                if (seriesData) {
                    setPopularSeries(seriesData.results.map(formatTMDBData).filter(Boolean) as MediaItem[]);
                }

            } catch (error) {
                console.error("Error loading homepage data:", error);
            }
        };
        loadData();
    }, []);

    return (
        <div>
            <Hero item={heroItem} />
            <div className="container mx-auto px-4 md:px-8 -mt-20 relative z-10 pb-16">
                <MediaCarousel title="Filmes Populares" items={popularMovies} viewMoreLink="/filmes" />
                <MediaCarousel title="Séries Populares" items={popularSeries} viewMoreLink="/series" />
            </div>
        </div>
    );
};

export default HomePage;