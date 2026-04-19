import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';

type CameraStatus = 'online' | 'offline' | 'warning';

interface CameraItem {
  id: number;
  name: string;
  zone: string;
  status: CameraStatus;
  workers: number;
  alerts: number;
  lastMotion: string;
  selected?: boolean;
}

interface EventItem {
  id: number;
  time: string;
  title: string;
  zone: string;
  level: 'info' | 'warning' | 'danger';
}

@Component({
  selector: 'app-live-stream',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './live-stream.html',
  styleUrl: './live-stream.scss',
})
export class LiveStream implements OnInit, OnDestroy {
  now = signal(new Date());

  streamTitle = signal('Main Safety Camera');
  streamZone = signal('Production Zone A');
  isLive = signal(true);
  isRecording = signal(true);
  fullscreen = signal(false);
  soundEnabled = signal(false);

  cameras = signal<CameraItem[]>([
    {
      id: 1,
      name: 'Camera A1',
      zone: 'Production Zone A',
      status: 'online',
      workers: 12,
      alerts: 1,
      lastMotion: '2 sec ago',
      selected: true,
    },
    {
      id: 2,
      name: 'Camera A2',
      zone: 'Helmet Check Gate',
      status: 'warning',
      workers: 5,
      alerts: 2,
      lastMotion: '10 sec ago',
    },
    {
      id: 3,
      name: 'Camera B1',
      zone: 'Chemical Storage',
      status: 'online',
      workers: 2,
      alerts: 0,
      lastMotion: '1 min ago',
    },
    {
      id: 4,
      name: 'Camera C1',
      zone: 'Loading Area',
      status: 'offline',
      workers: 0,
      alerts: 0,
      lastMotion: '15 min ago',
    },
    {
      id: 5,
      name: 'Camera D1',
      zone: 'Workshop',
      status: 'online',
      workers: 7,
      alerts: 0,
      lastMotion: '5 sec ago',
    },
    {
      id: 6,
      name: 'Camera E1',
      zone: 'Parking Entrance',
      status: 'online',
      workers: 3,
      alerts: 1,
      lastMotion: '12 sec ago',
    },
  ]);

  recentEvents = signal<EventItem[]>([
    {
      id: 1,
      time: '09:12:44',
      title: 'Helmet not detected',
      zone: 'Helmet Check Gate',
      level: 'danger',
    },
    {
      id: 2,
      time: '09:10:21',
      title: 'Unauthorized area motion',
      zone: 'Chemical Storage',
      level: 'warning',
    },
    {
      id: 3,
      time: '09:08:02',
      title: 'Normal worker activity',
      zone: 'Production Zone A',
      level: 'info',
    },
    {
      id: 4,
      time: '09:05:31',
      title: 'Vest detection alert',
      zone: 'Loading Area',
      level: 'warning',
    },
  ]);

  private timer: any;

  ngOnInit(): void {
    this.timer = setInterval(() => {
      this.now.set(new Date());
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  selectCamera(camera: CameraItem): void {
    this.cameras.update((list) =>
      list.map((c) => ({ ...c, selected: c.id === camera.id }))
    );

    this.streamTitle.set(camera.name);
    this.streamZone.set(camera.zone);
    this.isLive.set(camera.status !== 'offline');
  }

  toggleSound(): void {
    this.soundEnabled.update((v) => !v);
  }

  toggleRecording(): void {
    this.isRecording.update((v) => !v);
  }

  toggleFullscreen(): void {
    this.fullscreen.update((v) => !v);
  }

  refreshDemo(): void {
    const randomStatuses: CameraStatus[] = ['online', 'warning', 'offline'];

    this.cameras.update((list) =>
      list.map((cam, index) => ({
        ...cam,
        status: randomStatuses[(index + Math.floor(Math.random() * 3)) % 3],
        workers: Math.max(0, Math.floor(Math.random() * 15)),
        alerts: Math.floor(Math.random() * 4),
        lastMotion: `${Math.floor(Math.random() * 59) + 1} sec ago`,
      }))
    );

    const selected = this.cameras().find((c) => c.selected);
    if (selected) {
      this.isLive.set(selected.status !== 'offline');
    }
  }

  statusLabel(status: CameraStatus): string {
    switch (status) {
      case 'online':
        return 'Online';
      case 'offline':
        return 'Offline';
      case 'warning':
        return 'Warning';
      default:
        return status;
    }
  }

  eventBadge(level: EventItem['level']): string {
    switch (level) {
      case 'danger':
        return 'Critical';
      case 'warning':
        return 'Warning';
      default:
        return 'Info';
    }
  }

  totalOnline(): number {
    return this.cameras().filter((c) => c.status === 'online').length;
  }

  totalWarnings(): number {
    return this.cameras().filter((c) => c.status === 'warning').length;
  }

  totalOffline(): number {
    return this.cameras().filter((c) => c.status === 'offline').length;
  }

  selectedCamera() {
    return this.cameras().find((c) => c.selected) ?? null;
  }
}