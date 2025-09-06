
import { Injectable, signal } from '@angular/core';

export interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  notifications = signal<Notification[]>([]);
  private lastId = 0;

  show(message: string, type: 'success' | 'error' | 'info' = 'info') {
    const newNotification: Notification = {
      id: this.lastId++,
      message,
      type
    };

    this.notifications.update(current => [...current, newNotification]);

    setTimeout(() => {
      this.removeNotification(newNotification.id);
    }, 4000);
  }

  removeNotification(id: number) {
    this.notifications.update(current => current.filter(n => n.id !== id));
  }
}
