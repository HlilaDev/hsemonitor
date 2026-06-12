import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmModalService } from '../../../core/services/confirm-modal/confirm-modal.service';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-modal.html',
  styleUrl: './confirm-modal.scss',
})
export class ConfirmModalComponent {
  modal = inject(ConfirmModalService);
}
