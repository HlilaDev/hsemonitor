import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _counter = 0;
  toasts = signal<Toast[]>([]);

  private show(message: string, type: ToastType, duration: number): void {
    const id = ++this._counter;
    this.toasts.update(list => [...list, { id, type, message }]);
    setTimeout(() => this.dismiss(id), duration);
  }

  success(msg: string, duration = 4000) { this.show(msg, 'success', duration); }
  error(msg: string, duration = 5000)   { this.show(msg, 'error',   duration); }
  warning(msg: string, duration = 4000) { this.show(msg, 'warning', duration); }
  info(msg: string, duration = 4000)    { this.show(msg, 'info',    duration); }

  dismiss(id: number): void {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }
}
