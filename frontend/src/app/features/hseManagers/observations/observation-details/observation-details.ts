import { CommonModule, DatePipe, NgClass } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

import {
  ObservationService,
  Observation,
  ObservationStatus,
  ObservationSeverity,
  ObservationUser,
} from '../../../../core/services/observations/observation-services';

import {
  User,
  UserServices,
} from '../../../../core/services/users/user-services';

import { BASE_URL } from '../../../../core/config/api_urls';

type ObservationImage = {
  url: string;
  uploadedAt?: string;
};

type ExtendedObservation = Observation & {
  images?: ObservationImage[];
  resolutionComment?: string;
  resolutionImages?: ObservationImage[];
  resolvedAt?: string | null;
  resolvedBy?: string | ObservationUser | null;
  validationComment?: string;
  validatedAt?: string | null;
  validatedBy?: string | ObservationUser | null;
  assignedAt?: string | null;
  updatedAt?: string;
  status?: ObservationStatus | 'pending_validation' | 'reopened' | string;
};

@Component({
  selector: 'app-observation-details',
  standalone: true,
  imports: [CommonModule, NgClass, DatePipe, RouterModule],
  templateUrl: './observation-details.html',
  styleUrl: './observation-details.scss',
})
export class ObservationDetails {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private observationService = inject(ObservationService);
  private userServices = inject(UserServices);
  private destroyRef = inject(DestroyRef);

  loading = signal(true);
  error = signal('');
  observation = signal<ExtendedObservation | null>(null);

  selectedImageIndex = signal(0);
  selectedResolutionImageIndex = signal(0);

  assigning = signal(false);
  assignError = signal('');
  assignSuccess = signal('');

  agentsLoading = signal(false);
  agentsError = signal('');
  agents = signal<User[]>([]);
  selectedAgentId = signal('');

  reviewComment = signal('');
  reviewError = signal('');
  reviewSuccess = signal('');
  validating = signal(false);
  rejecting = signal(false);

  selectedImage = computed(() => {
    const obs = this.observation();
    if (!obs?.images?.length) return null;
    return obs.images[this.selectedImageIndex()] || null;
  });

  selectedResolutionImage = computed(() => {
    const obs = this.observation();
    if (!obs?.resolutionImages?.length) return null;
    return obs.resolutionImages[this.selectedResolutionImageIndex()] || null;
  });

  selectedAgentName = computed(() => {
    const agent = this.agents().find((item) => item._id === this.selectedAgentId());
    return agent ? this.getTeamUserName(agent) : '';
  });

  canShowAssignment = computed(() => {
    const obs = this.observation();
    if (!obs) return false;

    const status = obs.status;
    const alreadyAssigned = !!obs.assignedTo;

    return !alreadyAssigned && status !== 'pending_validation' && status !== 'closed';
  });

  canReviewValidation = computed(() => {
    return this.observation()?.status === 'pending_validation';
  });

  hasResolutionData = computed(() => {
    const obs = this.observation();
    return !!(
      obs?.resolutionComment ||
      obs?.resolvedAt ||
      obs?.resolvedBy ||
      obs?.resolutionImages?.length
    );
  });

  hasValidationData = computed(() => {
    const obs = this.observation();
    return !!(obs?.validationComment || obs?.validatedAt || obs?.validatedBy);
  });

  constructor() {
    this.loadPage();
  }

  loadPage(): void {
    this.loadObservation();
    this.loadAgents();
  }

  loadObservation(): void {
    this.loading.set(true);
    this.error.set('');
    this.assignError.set('');
    this.assignSuccess.set('');
    this.reviewError.set('');
    this.reviewSuccess.set('');

    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error.set('Identifiant de l’observation introuvable.');
      this.loading.set(false);
      return;
    }

    const sub = this.observationService
      .getById(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data: any) => {
          const item = (data?.observation ?? data?.item ?? data) as ExtendedObservation;

          this.observation.set(item);
          this.selectedImageIndex.set(0);
          this.selectedResolutionImageIndex.set(0);
          this.reviewComment.set(item?.validationComment || '');

          const assignedId =
            item?.assignedTo && typeof item.assignedTo !== 'string'
              ? item.assignedTo._id || ''
              : '';

          this.selectedAgentId.set(assignedId);
        },
        error: (err) => {
          console.error(err);
          this.error.set(
            err?.error?.message ||
              'Impossible de charger les détails de l’observation.'
          );
        },
      });

    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  loadAgents(): void {
    this.agentsLoading.set(true);
    this.agentsError.set('');

    const sub = this.userServices
      .getTeam()
      .pipe(finalize(() => this.agentsLoading.set(false)))
      .subscribe({
        next: (res: any) => {
          const items = Array.isArray(res?.items)
            ? res.items
            : Array.isArray(res)
              ? res
              : [];

          const onlyAgents = items.filter((user: any) => user?.role === 'agent');
          this.agents.set(onlyAgents);
        },
        error: (err: any) => {
          console.error(err);
          this.agentsError.set(
            err?.error?.message || err?.message || 'Impossible de charger la liste des agents.'
          );
        },
      });

    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  refresh(): void {
    this.loadPage();
  }

  goBack(): void {
    this.router.navigate(['/manager/observations']);
  }

  selectImage(index: number): void {
    this.selectedImageIndex.set(index);
  }

  selectResolutionImage(index: number): void {
    this.selectedResolutionImageIndex.set(index);
  }

  onSelectedAgentChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value ?? '';
    this.selectedAgentId.set(value);
    this.assignError.set('');
    this.assignSuccess.set('');
  }

  onReviewComment(value: string): void {
    this.reviewComment.set(value);
    this.reviewError.set('');
    this.reviewSuccess.set('');
  }

  assignObservation(): void {
    const obs = this.observation();
    const agentId = this.selectedAgentId().trim();

    if (!obs?._id) {
      this.assignError.set('Observation introuvable.');
      return;
    }

    if (!agentId) {
      this.assignError.set('Veuillez choisir un agent.');
      return;
    }

    this.assigning.set(true);
    this.assignError.set('');
    this.assignSuccess.set('');

    const sub = this.observationService
      .assign(obs._id, { assignedTo: agentId })
      .pipe(finalize(() => this.assigning.set(false)))
      .subscribe({
        next: (updated: any) => {
          const item = (updated?.observation ?? updated?.item ?? updated) as ExtendedObservation;
          this.observation.set(item);

          const assignedId =
            item?.assignedTo && typeof item.assignedTo !== 'string'
              ? item.assignedTo._id || ''
              : agentId;

          this.selectedAgentId.set(assignedId);
          this.assignSuccess.set('Observation affectée avec succès.');
        },
        error: (err) => {
          console.error(err);
          this.assignError.set(
            err?.error?.message || 'Impossible d’affecter cette observation.'
          );
        },
      });

    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  approveObservation(): void {
    const obs = this.observation();
    const comment = this.reviewComment().trim();

    if (!obs?._id) {
      this.reviewError.set('Observation introuvable.');
      return;
    }

    this.validating.set(true);
    this.reviewError.set('');
    this.reviewSuccess.set('');

    const serviceCall =
      (this.observationService as any).validate?.(obs._id, {
        validationComment: comment,
      }) ??
      (this.observationService as any).approve?.(obs._id, {
        validationComment: comment,
      });

    if (!serviceCall) {
      this.validating.set(false);
      this.reviewError.set(
        "Méthode de validation introuvable dans ObservationService. Ajoute validate() ou approve()."
      );
      return;
    }

    const sub = serviceCall
      .pipe(finalize(() => this.validating.set(false)))
      .subscribe({
        next: (updated: any) => {
          const item = (updated?.observation ?? updated?.item ?? updated) as ExtendedObservation;
          this.observation.set(item);
          this.reviewComment.set(item?.validationComment || comment);
          this.reviewSuccess.set('Observation validée avec succès.');
        },
        error: (err: any) => {
          console.error(err);
          this.reviewError.set(
            err?.error?.message || "Impossible de valider cette observation."
          );
        },
      });

    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  rejectObservation(): void {
    const obs = this.observation();
    const comment = this.reviewComment().trim();

    if (!obs?._id) {
      this.reviewError.set('Observation introuvable.');
      return;
    }

    if (!comment) {
      this.reviewError.set('Veuillez saisir un commentaire de refus.');
      return;
    }

    this.rejecting.set(true);
    this.reviewError.set('');
    this.reviewSuccess.set('');

    const serviceCall =
      (this.observationService as any).reject?.(obs._id, {
        validationComment: comment,
      }) ??
      (this.observationService as any).reopen?.(obs._id, {
        validationComment: comment,
      });

    if (!serviceCall) {
      this.rejecting.set(false);
      this.reviewError.set(
        "Méthode de refus introuvable dans ObservationService. Ajoute reject() ou reopen()."
      );
      return;
    }

    const sub = serviceCall
      .pipe(finalize(() => this.rejecting.set(false)))
      .subscribe({
        next: (updated: any) => {
          const item = (updated?.observation ?? updated?.item ?? updated) as ExtendedObservation;
          this.observation.set(item);
          this.reviewComment.set(item?.validationComment || comment);
          this.reviewSuccess.set('Observation refusée et renvoyée à l’agent.');
        },
        error: (err: any) => {
          console.error(err);
          this.reviewError.set(
            err?.error?.message || "Impossible de refuser cette observation."
          );
        },
      });

    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  zoneName(): string {
    const obs = this.observation();
    if (!obs?.zone) return '-';
    return typeof obs.zone === 'string' ? obs.zone : obs.zone.name || '-';
  }

  reporterName(): string {
    return this.getObservationUserName(this.observation()?.reportedBy);
  }

  reporterEmail(): string {
    return this.getObservationUserEmail(this.observation()?.reportedBy);
  }

  assignedToName(): string {
    return this.getObservationUserName(this.observation()?.assignedTo, 'Non affectée');
  }

  assignedToEmail(): string {
    return this.getObservationUserEmail(this.observation()?.assignedTo);
  }

  assignedByName(): string {
    return this.getObservationUserName(this.observation()?.assignedBy, 'Non défini');
  }

  assignedAtLabel(): string {
    const value = this.observation()?.assignedAt;
    if (!value) return '-';
    return new Date(value).toLocaleString('fr-FR');
  }

  resolvedByName(): string {
    return this.getObservationUserName(this.observation()?.resolvedBy, 'Non renseigné');
  }

  resolvedAtLabel(): string {
    const value = this.observation()?.resolvedAt;
    if (!value) return '-';
    return new Date(value).toLocaleString('fr-FR');
  }

  validatedByName(): string {
    return this.getObservationUserName(this.observation()?.validatedBy, 'Non renseigné');
  }

  validatedAtLabel(): string {
    const value = this.observation()?.validatedAt;
    if (!value) return '-';
    return new Date(value).toLocaleString('fr-FR');
  }

  hasImages(): boolean {
    return !!this.observation()?.images?.length;
  }

  hasResolutionImages(): boolean {
    return !!this.observation()?.resolutionImages?.length;
  }

  imageCount(): number {
    return this.observation()?.images?.length || 0;
  }

  resolutionImageCount(): number {
    return this.observation()?.resolutionImages?.length || 0;
  }

  getSeverityLabel(value?: ObservationSeverity): string {
    switch (value) {
      case 'low':
        return 'Faible';
      case 'medium':
        return 'Moyenne';
      case 'high':
        return 'Élevée';
      case 'critical':
        return 'Critique';
      default:
        return '-';
    }
  }

  getStatusLabel(value?: ObservationStatus | string): string {
    switch (value) {
      case 'open':
        return 'Ouverte';
      case 'in_progress':
        return 'En cours';
      case 'pending_validation':
        return 'En attente de validation';
      case 'reopened':
        return 'Rouverte';
      case 'closed':
        return 'Clôturée';
      default:
        return '-';
    }
  }

  getImageUrl(url?: string): string {
    if (!url) return '';

    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    const normalized = url.startsWith('/') ? url.slice(1) : url;
    return `${BASE_URL}${normalized}`;
  }

  trackByAgent = (_: number, agent: User) => agent?._id || _;
  trackByImage = (_: number, image: ObservationImage) => image?.url || _;

  private getObservationUserName(
    user?: string | ObservationUser | null,
    fallback = '-'
  ): string {
    if (!user) return fallback;
    if (typeof user === 'string') return user;

    return (
      user.fullName ||
      `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
      user.name ||
      user.email ||
      fallback
    );
  }

  private getObservationUserEmail(
    user?: string | ObservationUser | null
  ): string {
    if (!user || typeof user === 'string') return '-';
    return user.email || '-';
  }

  private getTeamUserName(user?: User | null): string {
    if (!user) return '-';
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
  }
}