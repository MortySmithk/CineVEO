import React from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { MediaItem } from '../types';

interface HeroProps {
    item: MediaItem | null;
}

const Hero: React.FC<HeroProps> = ({ item }) => {
    if (!item) {
        return (
            <div className="relative w-full h-screen bg-black flex items-center justify-center">
                <p className="text-white">Carregando destaque...</p>
            </div>
        );
    }

    return (
        <section className="relative w-full h-screen -mt-20">
            {/* Background Image with Gradient Overlays */}
            <div className="absolute inset-0 z-0">
                <img src={item.background} alt={item.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent"></div>
            </div>

            {/* Content - MODIFIED to be centered */}
            <div className="relative z-10 h-full flex items-center justify-center text-white">
                <div className="container mx-auto px-12 max-w-4xl text-center">
                    <h1 className="text-6xl font-black tracking-wider uppercase mb-4" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}>
                        {item.title}
                    </h1>
                    <div className="flex items-center justify-center gap-4 text-gray-300 font-medium mb-4">
                        <span>{item.year}</span>
                        <span>|</span>
                        <span>1h 57m</span>
                        <div className="flex items-center gap-1 text-yellow-400">
                           <span className="font-bold text-lg">{item.rating?.toFixed(1)}</span>
                           <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} className={`w-4 h-4 ${i < Math.round((item.rating || 0) / 2) ? 'text-yellow-400' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.164c.969 0 1.371 1.24.588 1.81l-3.368 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.368-2.448a1 1 0 00-1.176 0l-3.368 2.448c-.784.57-1.838-.197-1.54-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.07 9.384c-.783-.57-.38-1.81.588-1.81h4.164a1 1 0 00.95-.69L9.049 2.927z" />
                                    </svg>
                                ))}
                           </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-4 mb-6">
                        {item.genres?.slice(0, 2).map(genre => (
                           <span key={genre.id} className="px-4 py-1 bg-white/10 border border-white/20 rounded-full text-sm">{genre.name}</span>
                        ))}
                    </div>

                    <p className="max-w-xl text-gray-300 mb-8 leading-relaxed line-clamp-3 mx-auto">
                        {item.synopsis}
                    </p>

                    <div className="flex items-center justify-center gap-4">
                        <Link to={`/media/${item.type}/${item.id}`} className="flex items-center justify-center gap-2 px-8 py-3 bg-white text-black font-bold rounded-md hover:bg-gray-300 transition-colors">
                            <Play className="w-5 h-5" />
                            Assistir Agora
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;