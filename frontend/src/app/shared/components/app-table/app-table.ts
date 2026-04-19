import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';

export type TableColumn<T> = {
  header: string;                 // texte déjà traduit OU clé, selon ton choix
  width?: string;
  align?: 'left' | 'center' | 'right';

  // soit text, soit template (cellTpl)
  cell?: (row: T) => any;
  cellTpl?: TemplateRef<{ $implicit: T }>;
};

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-table.html',
  styleUrl: './app-table.scss',
})
export class AppTable<T> {
  @Input({ required: true }) data!: T[];
  @Input({ required: true }) columns!: TableColumn<T>[];

  // header page
  @Input() title?: string;
  @Input() addLabel?: string;

  // state
  @Input() loading = false;
  @Input() error?: string;       // texte déjà traduit (ou composant error en dehors)
  @Input() emptyText = 'Empty';

  // actions (slot)
  @Input() actionsTpl?: TemplateRef<{ $implicit: T }>;

  // track
  @Input() trackBy: (index: number, row: T) => any = (i) => i;

  @Output() add = new EventEmitter<void>();
}