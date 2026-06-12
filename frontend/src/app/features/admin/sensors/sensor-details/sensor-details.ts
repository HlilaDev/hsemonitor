import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import {
  SensorServices,
  Sensor,
  Reading,
  SensorStatus,
} from '../../../../core/services/sensors/sensor-services';

export interface SensorHistoryEntry {
  timestamp: string | Date;
  value?: number;
  unit?: string;
  sensorType?: string;
  status: SensorStatus;
  message?: string;
}

@Component({
  selector: 'app-sensor-details',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TranslateModule],
  templateUrl: './sensor-details.html',
  styleUrls: ['./sensor-details.scss'],
})
export class SensorDetails implements OnInit {
  sensor: Sensor | null = null;
  isLoading = true;
  errorMessage: string | null = null;

  topicUrl = '';
  urlCopied = false;

  history: SensorHistoryEntry[] = [];
  isHistoryLoading = false;

  constructor(
    private sensorService: SensorServices,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const sensorId = this.route.snapshot.paramMap.get('id');

    if (!sensorId) {
      this.errorMessage = 'ID de capteur manquant';
      this.isLoading = false;
      return;
    }

    this.sensorService.getById(sensorId).subscribe({
      next: (data) => {
        this.sensor = data;
        this.isLoading = false;

        const deviceId = this.getDeviceId();

        this.topicUrl = deviceId
          ? `hsemonitor/devices/${deviceId}/telemetry`
          : 'Device ID manquant';

        this.loadHistory();
      },
      error: () => {
        this.errorMessage = 'Impossible de récupérer les détails du capteur';
        this.isLoading = false;
      },
    });
  }

  private loadHistory(): void {
    const deviceId = this.getDeviceId();

    if (!deviceId) {
      this.history = [];
      this.isHistoryLoading = false;
      return;
    }

    this.isHistoryLoading = true;

    const sensorType = this.normalizeSensorType(this.sensor?.type ?? '');

    this.sensorService
      .getHistoryByDevice(deviceId, sensorType, 10)
      .subscribe({
        next: (readings: Reading[]) => {
          this.history = readings.map((reading) => ({
            timestamp: reading.ts || reading.createdAt || new Date(),
            value: this.extractReadingValue(reading),
            unit: this.extractReadingUnit(reading),
            sensorType: reading.sensorType,
            status: this.sensor?.status ?? 'online',
            message: this.getReadingMessage(reading),
          }));

          this.isHistoryLoading = false;
        },
        error: () => {
          this.history = [];
          this.isHistoryLoading = false;
        },
      });
  }

  private getDeviceId(): string | null {
    if (!this.sensor) return null;

    if (this.sensor.deviceId) {
      return this.sensor.deviceId;
    }

    if (
      this.sensor.device &&
      typeof this.sensor.device === 'object' &&
      this.sensor.device.deviceId
    ) {
      return this.sensor.device.deviceId;
    }

    return null;
  }

  private normalizeSensorType(type: string): string {
    if (type === 'temperature' || type === 'humidity') return 'dht11';
    if (type === 'gas') return 'gas';
    return type;
  }

  private extractReadingValue(reading: Reading): number | undefined {
    if (!reading) return undefined;

    if (reading.sensorType === 'gas') {
      return (
        reading.values?.ppm ??
        reading.values?.value ??
        reading.values?.gas ??
        reading.raw?.value
      );
    }

    if (reading.sensorType === 'dht11') {
      if (this.sensor?.type === 'humidity') {
        return reading.values?.humidity;
      }

      return reading.values?.temperature;
    }

    return reading.values?.value ?? reading.raw?.value;
  }

  private extractReadingUnit(reading: Reading): string {
    if (this.sensor?.unit) return this.sensor.unit;

    if (reading.sensorType === 'gas') return 'ppm';
    if (this.sensor?.type === 'humidity') return '%';
    if (reading.sensorType === 'dht11') return '°C';

    return '';
  }

  private getReadingMessage(reading: Reading): string {
    if (reading.sensorType === 'gas') return 'Lecture gaz';

    if (reading.sensorType === 'dht11') {
      return this.sensor?.type === 'humidity'
        ? 'Lecture humidité'
        : 'Lecture température';
    }

    return 'Lecture normale';
  }

  getZoneName(): string {
    if (!this.sensor?.zone) return '—';

    if (typeof this.sensor.zone === 'object') {
      return this.sensor.zone.name;
    }

    return this.sensor.zone;
  }

  getCurrentValue(): string {
    if (!this.history.length) return '—';

    const latest = this.history[0];

    if (latest.value === undefined || latest.value === null) {
      return '—';
    }

    return `${latest.value} ${latest.unit ?? ''}`;
  }

  copyTopicUrl(): void {
    if (!this.topicUrl || this.topicUrl === 'Device ID manquant') return;

    navigator.clipboard
      .writeText(this.topicUrl)
      .then(() => {
        this.urlCopied = true;
        setTimeout(() => (this.urlCopied = false), 2000);
      })
      .catch(() => {
        const el = document.createElement('textarea');
        el.value = this.topicUrl;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);

        this.urlCopied = true;
        setTimeout(() => (this.urlCopied = false), 2000);
      });
  }
}