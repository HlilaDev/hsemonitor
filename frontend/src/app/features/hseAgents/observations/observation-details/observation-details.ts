import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { finalize, of, switchMap } from 'rxjs';

import {
  ObservationImage,
  ObservationService,
  ObservationSeverity,
  ObservationStatus,
} from '../../../../core/services/observations/observation-services';

import { AuthServices } from '../../../../core/services/auth/auth-services';
import { UploadServices } from '../../../../core/services/uploads/upload-services';
import { BASE_URL } from '../../../../core/config/api_urls';

type ObservationUserRef =
  | string
  | {
      _id: string;
      fullName?: string;
      firstName?: string;
      lastName?: string;
      name?: string;
      email?: string;
      role?: string;
    }
  | null
  | undefined;

type ProofPreview = {
  file: File;
  preview: string;
};

type ObservationItem = {
  _id: string;
  title: string;
  description: string;
  severity: ObservationSeverity;
  status: ObservationStatus;
  zone?: { _id: string; name: string };
  reportedBy?: ObservationUserRef;
  assignedTo?: ObservationUserRef;
  assignedBy?: ObservationUserRef;
  assignedAt?: string | null;
  images?: { url: string; uploadedAt?: string }[];
  resolutionComment?: string;
  resolutionImages?: { url: string; uploadedAt?: string }[];
  resolvedAt?: string | null;
  resolvedBy?: ObservationUserRef;
  validationComment?: string;
  validatedAt?: string | null;
  validatedBy?: ObservationUserRef;
  createdAt?: string;
};

@Component({
  selector: 'app-observation-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './observation-details.html',
  styleUrl: './observation-details.scss',
})
export class ObservationDetails {
  private route = inject(ActivatedRoute);
  private obsService = inject(ObservationService);
  private auth = inject(AuthServices);
  private upload = inject(UploadServices);
  private destroyRef = inject(DestroyRef);

  loading = signal(true);
  errorMsg = signal<string | null>(null);
  actionError = signal<string | null>(null);
  actionSuccess = signal<string | null>(null);
  submittingResolution = signal(false);

  id = signal<string>('');
  obs = signal<ObservationItem | null>(null);

  meId = signal<string>('');

  resolutionComment = signal('');
  proofPreviews = signal<ProofPreview[]>([]);

  hasImages = computed(() => (this.obs()?.images?.length ?? 0) > 0);
  hasResolutionImages = computed(
    () => (this.obs()?.resolutionImages?.length ?? 0) > 0
  );
  hasProofFiles = computed(() => this.proofPreviews().length > 0);

  proofFilesCountLabel = computed(() => {
    const count = this.proofPreviews().length;
    if (!count) return 'Aucun fichier sélectionné';
    return count === 1 ? '1 fichier sélectionné' : `${count} fichiers sélectionnés`;
  });

  isAssignedToMe = computed(() => {
    const assignedId = this.getUserId(this.obs()?.assignedTo);
    return !!assignedId && assignedId === this.meId();
  });

  canSubmitResolution = computed(() => {
    const current = this.obs();
    if (!current) return false;
    if (!this.isAssignedToMe()) return false;

    return current.status === 'in_progress' || current.status === 'reopened';
  });

  constructor() {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.id.set(id);

    this.destroyRef.onDestroy(() => {
      this.revokeAllProofPreviews();
    });

    if (!id) {
      this.loading.set(false);
      this.errorMsg.set('ID observation manquant.');
      return;
    }

    this.loadCurrentUser();
  }

  private loadCurrentUser() {
    this.auth.me().subscribe({
      next: (res: any) => {
        this.meId.set(res?.user?._id || '');
        this.load(this.id());
      },
      error: () => {
        this.load(this.id());
      },
    });
  }

  load(id: string) {
    this.loading.set(true);
    this.errorMsg.set(null);
    this.actionError.set(null);
    this.actionSuccess.set(null);

    this.obsService.getById(id).subscribe({
      next: (res: any) => {
        const item = (res?.observation ?? res?.item ?? res) as ObservationItem;
        this.obs.set(item);
        this.resolutionComment.set(item?.resolutionComment || '');
        this.loading.set(false);
      },
      error: (err: any) => {
        this.loading.set(false);
        this.errorMsg.set(
          err?.error?.message || "Impossible de charger l'observation."
        );
      },
    });
  }

  submitResolution() {
    const current = this.obs();
    if (!current || !this.canSubmitResolution()) return;

    this.submittingResolution.set(true);
    this.actionError.set(null);
    this.actionSuccess.set(null);

    const comment = this.resolutionComment().trim();
    const files = this.proofPreviews().map((item) => item.file);

    const upload$ = files.length
      ? this.upload.uploadImages(files)
      : of({ urls: [] as string[] });

    upload$
      .pipe(
        switchMap(({ urls }) => {
          const uploadedImages: ObservationImage[] = urls.map((url) => ({ url }));

          const resolutionImages: ObservationImage[] =
            uploadedImages.length > 0
              ? uploadedImages
              : current.resolutionImages ?? [];

          return this.obsService.resolve(current._id, {
            resolutionComment: comment,
            resolutionImages,
          });
        }),
        finalize(() => {
          this.submittingResolution.set(false);
        })
      )
      .subscribe({
        next: (res: any) => {
          const item = (res?.observation ?? res?.item ?? res) as ObservationItem;
          this.obs.set(item);
          this.resolutionComment.set(item?.resolutionComment || '');
          this.clearProofFiles();
          this.actionSuccess.set(
            'Le traitement a été soumis avec succès pour validation.'
          );
        },
        error: (err: any) => {
          this.actionError.set(
            err?.error?.message || 'Impossible de soumettre le traitement.'
          );
        },
      });
  }

  onResolutionComment(value: string) {
    this.resolutionComment.set(value);
  }

  onProofFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);

    if (!files.length) return;

    const acceptedFiles = files.filter((file) =>
      file.type.startsWith('image/')
    );

    const nextPreviews = acceptedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    this.proofPreviews.update((current) => [...current, ...nextPreviews]);

    input.value = '';
  }

  removeProofFile(index: number) {
    const current = [...this.proofPreviews()];
    const target = current[index];

    if (target?.preview) {
      URL.revokeObjectURL(target.preview);
    }

    current.splice(index, 1);
    this.proofPreviews.set(current);
  }

  clearProofFiles() {
    this.revokeAllProofPreviews();
    this.proofPreviews.set([]);
  }

  private revokeAllProofPreviews() {
    this.proofPreviews().forEach((item) => {
      if (item.preview) {
        URL.revokeObjectURL(item.preview);
      }
    });
  }

  getUserId(user: ObservationUserRef): string {
    if (!user) return '';
    return typeof user === 'string' ? user : user._id || '';
  }

  getUserDisplayName(user: ObservationUserRef): string {
    if (!user) return '—';
    if (typeof user === 'string') return user;

    return (
      user.fullName ||
      user.name ||
      `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
      user.email ||
      '—'
    );
  }

  getUserEmail(user: ObservationUserRef): string {
    if (!user || typeof user === 'string') return '—';
    return user.email || '—';
  }

  formatDate(iso?: string | null) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';

    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(d);
  }

  normalizeUrl(url?: string) {
    if (!url) return '';
    const raw = url.trim();

    if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;

    const clean = raw.startsWith('/') ? raw.slice(1) : raw;
    return `${BASE_URL}${clean}`;
  }

  openImage(url: string) {
    const full = this.normalizeUrl(url);
    if (full) window.open(full, '_blank', 'noopener,noreferrer');
  }

  trackByUrl = (_: number, it: { url: string }) => it.url;
  trackByProofPreview = (_: number, item: ProofPreview) =>
    `${item.file.name}-${item.file.size}-${item.file.lastModified}`;
}