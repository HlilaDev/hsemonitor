import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  computed,
  signal,
} from '@angular/core';

type ChecklistItemType = 'boolean' | 'text' | 'number';

export interface TemplateChecklistItem {
  _id?: string;
  label: string;
  type: ChecklistItemType;
  isRequired: boolean;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-template-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './template-item.html',
  styleUrl: './template-item.scss',
})
export class TemplateItem {
  @Input({ required: true }) item!: TemplateChecklistItem;
  @Input() index = 0;
  @Input() readonly = false;
  @Input() deleting = false;
  @Input() editing = false;

  @Output() edit = new EventEmitter<TemplateChecklistItem>();
  @Output() remove = new EventEmitter<TemplateChecklistItem>();

  hovered = signal(false);

  readonly typeLabel = computed(() => {
    switch (this.item?.type) {
      case 'boolean':
        return 'Oui / Non';
      case 'text':
        return 'Texte';
      case 'number':
        return 'Nombre';
      default:
        return '—';
    }
  });

  readonly requiredLabel = computed(() =>
    this.item?.isRequired ? 'Obligatoire' : 'Optionnel'
  );

  onEdit(): void {
    if (this.readonly || this.editing) return;
    this.edit.emit(this.item);
  }

  onRemove(): void {
    if (this.readonly || this.deleting) return;
    this.remove.emit(this.item);
  }

  onMouseEnter(): void {
    this.hovered.set(true);
  }

  onMouseLeave(): void {
    this.hovered.set(false);
  }
}