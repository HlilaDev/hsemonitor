import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CategoryScale,
  Chart,
  Filler,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js';

Chart.register(
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler
);

export interface TrendPoint {
  label: string;
  value: number;
}

@Component({
  selector: 'app-sensor-trend-curve',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sensor-trend-curve.html',
  styleUrl: './sensor-trend-curve.scss',
})
export class SensorTrendCurve implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('canvas') canvasRef?: ElementRef<HTMLCanvasElement>;

  @Input() points: TrendPoint[] = [];
  @Input() datasetLabel = 'Mesures';
  @Input() unit = '';
  @Input() color = '#2563eb';

  private chart: Chart<'line'> | null = null;
  private viewReady = false;

  get hasData(): boolean {
    return this.points.length > 0;
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.renderChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.viewReady) return;

    if (
      changes['points'] ||
      changes['datasetLabel'] ||
      changes['unit'] ||
      changes['color']
    ) {
      this.renderChart();
    }
  }

  private renderChart(): void {
    const canvas = this.canvasRef?.nativeElement;
    const ctx = canvas?.getContext('2d');

    if (!ctx) return;

    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }

    if (!this.points.length) {
      return;
    }

    const labels = this.points.map((point) => point.label);
    const values = this.points.map((point) => point.value);

    const gradient = ctx.createLinearGradient(0, 0, 0, 320);
    gradient.addColorStop(0, this.hexToRgba(this.color, 0.25));
    gradient.addColorStop(1, this.hexToRgba(this.color, 0.02));

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: this.datasetLabel,
            data: values,
            borderColor: this.color,
            backgroundColor: gradient,
            fill: true,
            tension: 0.35,
            pointRadius: 3,
            pointHoverRadius: 5,
            pointBackgroundColor: this.color,
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            borderWidth: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 600,
        },
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: '#0f172a',
            displayColors: false,
            padding: 12,
            titleColor: '#ffffff',
            bodyColor: '#e2e8f0',
            callbacks: {
              label: (context) => {
                const value = context.parsed.y;
                return this.unit ? `${value} ${this.unit}` : `${value}`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            border: {
              display: false,
            },
            ticks: {
              color: '#64748b',
              font: {
                size: 11,
                weight: 600,
              },
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 8,
            },
          },
          y: {
            beginAtZero: false,
            grid: {
              color: '#e2e8f0',
            },
            border: {
              display: false,
            },
            ticks: {
              color: '#64748b',
              font: {
                size: 11,
                weight: 600,
              },
              callback: (value) => {
                return this.unit ? `${value} ${this.unit}` : `${value}`;
              },
            },
          },
        },
      },
    });
  }

  private hexToRgba(hex: string, alpha: number): string {
    const clean = hex.replace('#', '');

    if (clean.length !== 6) {
      return `rgba(37, 99, 235, ${alpha})`;
    }

    const bigint = parseInt(clean, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }
}