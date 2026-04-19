import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

export type Variant = 'blue' | 'red' | 'green' | 'orange' | 'gray' | 'purple';
@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.scss',
})
export class StatCard {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) value!: string | number;

  @Input() subtitle = '';
  @Input() linkLabel = 'View Details';

  @Input() iconClass = 'bi bi-box';
  @Input() variant: Variant = 'blue';

  // ✅ accept readonly tuples from `as const`
  @Input() routerLink?: readonly any[];
}