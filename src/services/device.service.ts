
import { Injectable, signal } from '@angular/core';

export type DeviceType = 'desktop' | 'mobile' | 'tv';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {
  deviceType = signal<DeviceType>('desktop');

  constructor() {
    this.deviceType.set(this.detectDeviceType());
  }

  private detectDeviceType(): DeviceType {
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
}
