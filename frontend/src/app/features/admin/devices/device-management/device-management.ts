import { CommonModule } from '@angular/common';
import {
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, finalize, interval } from 'rxjs';

import {
  Device,
  DeviceServices,
} from '../../../../core/services/devices/device-services';

type CommandLog = {
  time: string;
  action: string;
  status: 'success' | 'pending' | 'failed';
  source: string;
};

type DeviceDetails = Device & {
  ipAddress?: string;
  macAddress?: string;
  firmware?: string;
  broker?: string;
  port?: number;
  samplingInterval?: number;
  threshold?: number;
  uptime?: number;
  battery?: number | null;
  signal?: number | null;
  memoryUsage?: number | null;
  cpuTemp?: number | null;
  networkType?: string;
  lastSeen?: string;
  timestamp?: string;
};

@Component({
  selector: 'app-device-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './device-management.html',
  styleUrl: './device-management.scss',
})
export class DeviceManagement implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private deviceService = inject(DeviceServices);

  private refreshSub?: Subscription;

  deviceId = this.route.snapshot.paramMap.get('id') ?? '';

  loading = signal(true);
  error = signal<string | null>(null);

  device = signal<DeviceDetails | null>(null);

  mqttEnabled = signal(true);
  maintenanceMode = signal(false);
  alertMode = signal(true);
  autoReconnect = signal(true);

  logs = signal<CommandLog[]>([
    { time: '18:41', action: 'Ping device', status: 'success', source: 'Dashboard' },
    { time: '18:37', action: 'Restart device', status: 'success', source: 'Dashboard' },
    { time: '18:25', action: 'Update threshold', status: 'pending', source: 'Admin panel' },
    { time: '17:58', action: 'Sync time', status: 'success', source: 'System' },
    { time: '17:30', action: 'Factory reset request', status: 'failed', source: 'Dashboard' },
  ]);

  selectedAction = signal<string>('None');
  showConfirmModal = signal(false);
  confirmTitle = signal('');
  confirmText = signal('');
  actionLoading = signal(false);
  actionError = signal<string | null>(null);

  zoneName = computed(() => {
    const current = this.device();
    if (!current) return '—';

    return typeof current.zone === 'string'
      ? current.zone
      : current.zone?.name || current.zone?._id || '—';
  });

  displayName = computed(() => {
    const current = this.device();
    if (!current) return 'Device';

    return current.name?.trim() || current.deviceId || 'Device';
  });

  isOnline = computed(() => {
    const status = this.device()?.status ?? 'offline';
    return status.toLowerCase() === 'online';
  });

  lastHeartbeat = computed(() => {
    const current = this.device();
    if (!current) return null;

    return current.lastSeen || current.timestamp || current.updatedAt || null;
  });

  isStale = computed(() => {
    const hb = this.lastHeartbeat();
    if (!hb) return true;

    const last = new Date(hb).getTime();
    if (Number.isNaN(last)) return true;

    return Date.now() - last > 2 * 60 * 1000;
  });

  heartbeatLabel = computed(() => {
    if (!this.lastHeartbeat()) return 'No heartbeat';
    if (!this.isOnline()) return 'Device offline';
    if (this.isStale()) return 'Heartbeat delayed';
    return 'Heartbeat fresh';
  });

  signalLabel = computed(() => {
    const value = this.device()?.signal;
    if (value === null || value === undefined) return 'Unknown';
    if (value >= -55) return 'Excellent';
    if (value >= -67) return 'Good';
    if (value >= -75) return 'Fair';
    return 'Weak';
  });

  signalLevelClass = computed(() => {
    const value = this.device()?.signal;
    if (value === null || value === undefined) return 'neutral';
    if (value >= -55) return 'excellent';
    if (value >= -67) return 'good';
    if (value >= -75) return 'fair';
    return 'weak';
  });

  cpuTempState = computed(() => {
    const temp = this.device()?.cpuTemp;
    if (temp === null || temp === undefined) return 'normal';
    if (temp >= 75) return 'critical';
    if (temp >= 65) return 'warning';
    return 'normal';
  });

  memoryState = computed(() => {
    const memory = this.device()?.memoryUsage;
    if (memory === null || memory === undefined) return 'normal';
    if (memory >= 90) return 'critical';
    if (memory >= 75) return 'warning';
    return 'normal';
  });

  batteryLabel = computed(() => {
    const battery = this.device()?.battery;
    if (battery === null || battery === undefined) return 'N/A';
    return `${battery}%`;
  });

  formattedUptime = computed(() => {
    const seconds = this.device()?.uptime;
    if (seconds === null || seconds === undefined) return '—';

    const total = Math.max(0, Number(seconds));
    const days = Math.floor(total / 86400);
    const hours = Math.floor((total % 86400) / 3600);
    const minutes = Math.floor((total % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  });

  healthItems = computed(() => {
    const current = this.device();

    return [
      {
        label: 'CPU Temperature',
        value:
          current?.cpuTemp !== null && current?.cpuTemp !== undefined
            ? `${current.cpuTemp} °C`
            : '—',
        state: this.cpuTempState(),
      },
      {
        label: 'Memory Usage',
        value:
          current?.memoryUsage !== null && current?.memoryUsage !== undefined
            ? `${current.memoryUsage}%`
            : '—',
        state: this.memoryState(),
      },
      {
        label: 'Wi-Fi Quality',
        value: this.signalLabel(),
        state: this.signalLevelClass(),
      },
      {
        label: 'Network Type',
        value: current?.networkType || '—',
        state: 'neutral',
      },
    ];
  });

  ngOnInit(): void {
    this.loadDevice();

    this.refreshSub = interval(30000).subscribe(() => {
      this.loadDevice(false);
    });
  }

  ngOnDestroy(): void {
    this.refreshSub?.unsubscribe();
  }

  loadDevice(showLoader = true) {
    if (!this.deviceId) {
      this.error.set('Device id not found in route.');
      this.loading.set(false);
      return;
    }

    if (showLoader) {
      this.loading.set(true);
    }

    this.error.set(null);

    this.deviceService
      .getDeviceById(this.deviceId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (result) => {
          this.device.set({
            ...result,
            broker: (result as DeviceDetails).broker || 'broker.hivemq.com',
            port: (result as DeviceDetails).port || 1883,
            samplingInterval: (result as DeviceDetails).samplingInterval || 60,
            threshold: (result as DeviceDetails).threshold || 75,
            ipAddress: (result as DeviceDetails).ipAddress || '',
            macAddress: (result as DeviceDetails).macAddress || '',
            firmware: (result as DeviceDetails).firmware || '',
            uptime:
              (result as DeviceDetails).uptime !== undefined &&
              (result as DeviceDetails).uptime !== null
                ? Number((result as DeviceDetails).uptime)
                : undefined,
            battery:
              (result as DeviceDetails).battery !== undefined
                ? (result as DeviceDetails).battery
                : null,
            signal:
              (result as DeviceDetails).signal !== undefined
                ? (result as DeviceDetails).signal
                : null,
            memoryUsage:
              (result as DeviceDetails).memoryUsage !== undefined
                ? (result as DeviceDetails).memoryUsage
                : null,
            cpuTemp:
              (result as DeviceDetails).cpuTemp !== undefined
                ? (result as DeviceDetails).cpuTemp
                : null,
            networkType: (result as DeviceDetails).networkType || '',
            lastSeen:
              (result as DeviceDetails).lastSeen ||
              (result as DeviceDetails).timestamp ||
              result.updatedAt ||
              '',
          });
        },
        error: (err) => {
          this.error.set(err?.error?.message ?? 'Failed to load device.');
        },
      });
  }

  onAction(action: string) {
    const current = this.device();

    if (!this.isOnline() && action !== 'Refresh status') {
      this.logs.update((currentLogs) => [
        {
          time: 'Now',
          action,
          status: 'failed',
          source: 'Dashboard',
        },
        ...currentLogs,
      ]);
      return;
    }

    this.selectedAction.set(action);
    this.confirmTitle.set(action);
    this.confirmText.set(
      `This action will send a command to device ${current?.deviceId ?? this.deviceId}.`
    );
    this.actionError.set(null);
    this.showConfirmModal.set(true);
  }

  closeModal() {
    if (this.actionLoading()) return;
    this.showConfirmModal.set(false);
  }

  confirmAction() {
    const action = this.selectedAction();

    if (action === 'Restart device') {
      this.restartDevice();
      return;
    }

    if (action === 'Refresh status') {
      this.loadDevice(false);
      this.pushLog(action, 'success', 'Dashboard');
      this.showConfirmModal.set(false);
      return;
    }

    this.pushLog(action, 'pending', 'Dashboard');
    this.showConfirmModal.set(false);
  }

  restartDevice() {
    if (!this.deviceId) {
      this.actionError.set('Device id not found in route.');
      return;
    }

    this.actionLoading.set(true);
    this.actionError.set(null);

    this.deviceService
      .restartDevice(this.deviceId)
      .pipe(finalize(() => this.actionLoading.set(false)))
      .subscribe({
        next: () => {
          this.pushLog('Restart device', 'success', 'Dashboard');
          this.showConfirmModal.set(false);
        },
        error: (err) => {
          this.actionError.set(
            err?.error?.message ?? 'Failed to send restart command.'
          );
          this.pushLog('Restart device', 'failed', 'Dashboard');
        },
      });
  }

  pushLog(action: string, status: CommandLog['status'], source: string) {
    const now = new Date();
    const time = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    this.logs.update((current) => [
      {
        time,
        action,
        status,
        source,
      },
      ...current,
    ]);
  }

  toggleMqtt() {
    this.mqttEnabled.update((value) => !value);
    this.pushLog('Toggle MQTT communication', 'success', 'Admin panel');
  }

  toggleMaintenance() {
    this.maintenanceMode.update((value) => !value);
    this.pushLog('Toggle maintenance mode', 'success', 'Admin panel');
  }

  toggleAlertMode() {
    this.alertMode.update((value) => !value);
    this.pushLog('Toggle alert mode', 'success', 'Admin panel');
  }

  toggleReconnect() {
    this.autoReconnect.update((value) => !value);
    this.pushLog('Toggle auto reconnect', 'success', 'Admin panel');
  }

  getStatusClass(status?: string) {
    return (status ?? 'offline').toLowerCase();
  }

  getHeartbeatClass() {
    if (!this.isOnline()) return 'danger';
    if (this.isStale()) return 'warn';
    return 'ok';
  }

  onBack() {
    this.router.navigate(['/admin/devices']);
  }
}