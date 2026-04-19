import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Filler
);

@Component({
  selector: 'app-temperature-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './temperature-chart.html',
  styleUrl: './temperature-chart.scss',
})
export class TemperatureChart implements AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  chart: Chart | null = null;

  ngAfterViewInit(): void {
    this.loadChart();
  }

  loadChart(): void {
    const readings = [
      { value: 28.4, createdAt: '2026-03-10T08:00:00.000Z' },
      { value: 29.1, createdAt: '2026-03-10T09:00:00.000Z' },
      { value: 31.8, createdAt: '2026-03-10T10:00:00.000Z' },
      { value: 33.2, createdAt: '2026-03-10T11:00:00.000Z' },
      { value: 30.6, createdAt: '2026-03-10T12:00:00.000Z' },
      { value: 27.9, createdAt: '2026-03-10T13:00:00.000Z' },
    ];

    const labels = readings.map((item) =>
      new Date(item.createdAt).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    );

    const values = readings.map((item) => item.value);

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Température',
            data: values,
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.12)',
            borderWidth: 3,
            pointBackgroundColor: '#2563eb',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.35,
            fill: true,
          },
          {
            label: 'Seuil critique',
            data: values.map(() => 50),
            borderColor: '#ef4444',
            borderWidth: 2,
            borderDash: [8, 6],
            pointRadius: 0,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            display: true,
            labels: {
              color: '#475569',
              font: {
                weight: 600,
              },
            },
          },
          tooltip: {
            backgroundColor: '#0f172a',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            padding: 12,
            displayColors: true,
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
            },
          },
        },
      },
    });
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}