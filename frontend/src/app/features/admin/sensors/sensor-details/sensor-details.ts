import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FormsModule }        from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { SensorServices, Sensor } from '../../../../core/services/sensors/sensor-services';

// ── History entry model ───────────────────────────────────────────
export interface SensorHistoryEntry {
  timestamp: string | Date;
  value?:    number;
  status:    'online' | 'offline' | 'maintenance';
  message?:  string;
}

@Component({
  selector:    'app-sensor-details',
  standalone:  true,
  imports:     [CommonModule, RouterLink, FormsModule],
  templateUrl: './sensor-details.html',
  styleUrls:   ['./sensor-details.scss'],
})
export class SensorDetails implements OnInit {

  // ── State ────────────────────────────────────────────────────────
  sensor:       Sensor | null = null;
  isLoading     = true;
  errorMessage: string | null = null;

  // Topic URL (editable field)
  topicUrl  = '';
  urlCopied = false;

  // History
  history:          SensorHistoryEntry[] = [];
  isHistoryLoading  = false;

  constructor(
    private sensorService: SensorServices,
    private route:         ActivatedRoute,
  ) {}

  // ── Lifecycle ────────────────────────────────────────────────────
  ngOnInit(): void {
    const sensorId = this.route.snapshot.paramMap.get('id');

    if (!sensorId) {
      this.errorMessage = 'ID de capteur manquant';
      this.isLoading    = false;
      return;
    }

    this.sensorService.getById(sensorId).subscribe({
      next: (data) => {
        this.sensor    = data;
        this.isLoading = false;

        // Pre-fill topic URL as a suggested MQTT topic
        this.topicUrl = `sensors/${data._id}/data`;

        // Load history after sensor is loaded
        this.loadHistory(sensorId);
      },
      error: () => {
        this.errorMessage = 'Impossible de récupérer les détails du capteur';
        this.isLoading    = false;
      },
    });
  }

  // ── History ───────────────────────────────────────────────────────
  /**
   * Replace this method body with your real API call, e.g.:
   *   this.sensorService.getHistory(sensorId).subscribe(...)
   *
   * The mock data below is for development/demo purposes only.
   */
  private loadHistory(sensorId: string): void {
    this.isHistoryLoading = true;

    // TODO: replace with real service call
    // this.sensorService.getHistory(sensorId).subscribe({
    //   next:  (data) => { this.history = data; this.isHistoryLoading = false; },
    //   error: ()     => { this.isHistoryLoading = false; },
    // });

    // ── Mock data (remove when API is ready) ──────────────────────
    setTimeout(() => {
      this.history = [
        { timestamp: new Date(),                             value: 24.3, status: 'online',      message: 'Lecture normale' },
        { timestamp: new Date(Date.now() - 1 * 3600_000),   value: 24.1, status: 'online',      message: 'Lecture normale' },
        { timestamp: new Date(Date.now() - 2 * 3600_000),   value: 28.9, status: 'maintenance', message: 'Seuil dépassé' },
        { timestamp: new Date(Date.now() - 5 * 3600_000),   value: 0,    status: 'offline',     message: 'Connexion perdue' },
        { timestamp: new Date(Date.now() - 8 * 3600_000),   value: 23.7, status: 'online',      message: 'Lecture normale' },
        { timestamp: new Date(Date.now() - 12 * 3600_000),  value: 23.5, status: 'online',      message: 'Lecture normale' },
      ];
      this.isHistoryLoading = false;
    }, 600);
    // ─────────────────────────────────────────────────────────────
  }

  // ── Helpers ───────────────────────────────────────────────────────

  /** Safely resolves zone name whether zone is populated or a plain ID string. */
  getZoneName(): string {
    if (!this.sensor?.zone) return '—';
    if (typeof this.sensor.zone === 'object') return this.sensor.zone.name;
    return this.sensor.zone;
  }

  /** Copies the Topic URL field value to the clipboard. */
  copyTopicUrl(): void {
    if (!this.topicUrl) return;

    navigator.clipboard.writeText(this.topicUrl).then(() => {
      this.urlCopied = true;
      setTimeout(() => (this.urlCopied = false), 2000);
    }).catch(() => {
      // Fallback for older browsers
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