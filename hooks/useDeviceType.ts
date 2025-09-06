
import { useState, useEffect } from 'react';

export type DeviceType = 'desktop' | 'mobile' | 'tv';

const detectDeviceType = (): DeviceType => {
    const ua = navigator.userAgent.toLowerCase();
    const tvKeywords = ['tv', 'tizen', 'webos', 'smart-tv', 'bravia', 'viera', 'googletv', 'crkey', 'netcast', 'dtv'];
    const mobileKeywords = ['iphone', 'ipod', 'ipad', 'android', 'webos', 'blackberry', 'windows phone'];

    if (tvKeywords.some(keyword => ua.includes(keyword))) {
        return 'tv';
    }
    if (mobileKeywords.some(keyword => ua.includes(keyword)) || (navigator.maxTouchPoints > 0 && window.innerWidth < 1024)) {
        return 'mobile';
    }
    return 'desktop';
};

export const useDeviceType = (): DeviceType => {
    const [deviceType, setDeviceType] = useState<DeviceType>(detectDeviceType());

    useEffect(() => {
        const handleResize = () => {
            setDeviceType(detectDeviceType());
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return deviceType;
};
