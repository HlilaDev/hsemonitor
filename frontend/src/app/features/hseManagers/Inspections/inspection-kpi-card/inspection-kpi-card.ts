import { CommonModule } from '@angular/common';
import { Component, Input, computed } from '@angular/core';

type KpiTone = 'blue' | 'green' | 'amber' | 'purple' | 'red';

@Component({
  selector: 'app-inspection-kpi-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inspection-kpi-card.html',
  styleUrl: './inspection-kpi-card.scss',
})
export class InspectionKpiCard {
  @Input({ required: true }) title = '';
  @Input({ required: true }) value: string | number = 0;
  @Input() subtitle = '';
  @Input() icon = 'bi bi-bar-chart-line';
  @Input() tone: KpiTone = 'blue';

  readonly toneClass = computed(() => `icon ${this.tone}`);
}