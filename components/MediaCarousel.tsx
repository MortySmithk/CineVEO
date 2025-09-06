
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import MediaCard from './MediaCard';
import { MediaItem } from '../types';

import 'swiper/css';
import 'swiper/css/navigation';

interface MediaCarouselProps {
    title: string;
    items: MediaItem[];
    viewMoreLink?: string;
}

const MediaCarousel: React.FC<MediaCarouselProps> = ({ title, items, viewMoreLink }) => {
    if (!items || items.length === 0) return null;

    return (
        <div className="mb-8 md:mb-12">
            <div className="flex justify-between items-baseline mb-4 px-4 md:px-8">
                <h2 className="text-xl md:text-2xl font-bold text-white">{title}</h2>
                {viewMoreLink && (
                    <Link to={viewMoreLink} className="text-yellow-400 font-semibold hover:underline text-sm flex items-center gap-1">
                        Ver todos <ChevronRight size={16} />
                    </Link>
                )}
            </div>
            <Swiper
                modules={[Navigation]}
                navigation={{
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                }}
                spaceBetween={16}
                slidesPerView={'auto'}
                className="!px-4 md:!px-8"
            >
                {items.map(item => item && (
                    <SwiperSlide key={item.id} className="!w-[150px] md:!w-[180px]">
                        <MediaCard item={item} />
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default MediaCarousel;
