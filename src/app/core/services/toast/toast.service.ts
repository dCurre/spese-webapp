import { Injectable } from '@angular/core';

export interface Toast {
  message: string;
  type: 'error' | 'success';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts: Toast[] = [];

  error(message: string) {
    this.toasts.push({ message, type: 'error' });
  }

  success(message: string) {
    this.toasts.push({ message, type: 'success' });
  }

  remove(toast: Toast) {
    this.toasts = this.toasts.filter(t => t !== toast);
  }
}
