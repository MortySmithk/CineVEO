import React from 'react';
import { Link } from 'react-router-dom';
import { MediaItem } from '../types';

interface MediaCardProps {
    item: MediaItem;
}

const MediaCard: React.FC<MediaCardProps> = ({ item }) => {
    return (
        <Link to={`/media/${item.type}/${item.id}${item.resumeLink || ''}`} className="block group" data-tv-focusable>
            <div className="relative aspect-[2/3] bg-gray-800 rounded-lg overflow-hidden">
                <img 
                    loading="lazy" 
                    src={item.poster} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-110 group-hover:blur-sm" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    {/* AQUI: Ajustado para w-24 h-24 para ser maior */}
                    <div className="w-24 h-24 transform transition-transform duration-300 group-hover:scale-110">
                        <img src="https://i.ibb.co/Q7V0pybV/bot-o-play-sem-bg.png" alt="Play" className="w-full h-full object-contain" />
                    </div>
                </div>
                 <img src="https://i.ibb.co/PGJ87dN5/cineveo-logo-r.png" alt="CineVEO Logo" className="absolute bottom-2 right-2 w-auto h-4 opacity-60 z-10 hidden md:block" />
            </div>
            <h3 className="font-semibold text-white/90 truncate mt-2 text-sm md:text-base group-hover:text-yellow-400 transition-colors">{item.title}</h3>
            <p className="text-xs text-gray-400 hidden md:block">{item.year}</p>
        </Link>
    );
};

export default MediaCard;