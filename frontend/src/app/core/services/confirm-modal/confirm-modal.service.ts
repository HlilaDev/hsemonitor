import { Injectable, signal } from '@angular/core';

export interface ConfirmConfig {
  title?: string;
  message: string;
  itemName?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmModalService {
  config = signal<ConfirmConfig | null>(null);

  open(cfg: ConfirmConfig): void {
    this.config.set(cfg);
  }

  confirm(): void {
    this.config()?.onConfirm();
    this.config.set(null);
  }

  cancel(): void {
    this.config.set(null);
  }
}
