import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  computed,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

export type InspectionStatus = 'ok' | 'issue_found' | 'pending';

export type InspectionCondition =
  | ''
  | 'new'
  | 'good'
  | 'fair'
  | 'poor'
  | 'damaged'
  | 'expired';

export interface InspectionZoneOption {
  _id: string;
  name: string;
  code?: string;
}

export interface InspectionInventoryItem {
  _id: string;
  name: string;
  inventoryCode?: string;
  category?: string;
  subCategory?: string;
  status?: string;
  condition?: string;
  quantity?: number;
  unit?: string;
  zone?: string | { _id?: string; name?: string } | null;
  nextInspectionDate?: string | null;
}

export interface AddInventoryInspectionPayload {
  inspectionDate: string;
  status: InspectionStatus;
  condition?: string;
  findings?: string;
  actionsRequired?: string;
  nextInspectionDate?: string | null;
  zone?: string | null;
  notes?: string;
}

@Component({
  selector: 'app-add-inventory-inspection-model',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-inventory-inspection-model.html',
  styleUrl: './add-inventory-inspection-model.scss',
})
export class AddInventoryInspectionModel {
  private _open = false;

  @Input()
  set open(value: boolean) {
    this._open = value;

    if (value) {
      this.resetForm();
    }
  }

  get open(): boolean {
    return this._open;
  }

  @Input() loading = false;
  @Input() errorMessage = '';
  @Input() item: InspectionInventoryItem | null = null;
  @Input() zones: InspectionZoneOption[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<AddInventoryInspectionPayload>();

  submitted = signal(false);

  inspectionDate = signal(this.todayInputDate());
  status = signal<InspectionStatus>('ok');
  condition = signal<InspectionCondition>('');
  zone = signal('');
  findings = signal('');
  actionsRequired = signal('');
  nextInspectionDate = signal('');
  notes = signal('');

  statusOptions: ReadonlyArray<{ value: InspectionStatus; label: string }> = [
    { value: 'ok', label: 'Conforme' },
    { value: 'issue_found', label: 'Anomalie détectée' },
    { value: 'pending', label: 'En attente' },
  ];

  conditionOptions: ReadonlyArray<{ value: InspectionCondition; label: string }> = [
    { value: '', label: 'Non précisé' },
    { value: 'new', label: 'Neuf' },
    { value: 'good', label: 'Bon' },
    { value: 'fair', label: 'Moyen' },
    { value: 'poor', label: 'Faible' },
    { value: 'damaged', label: 'Endommagé' },
    { value: 'expired', label: 'Expiré' },
  ];

  selectedZone = computed(() => {
    return this.zones.find((zone) => zone._id === this.zone()) || null;
  });

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget && !this.loading) {
      this.onClose();
    }
  }

  onClose(): void {
    if (this.loading) return;
    this.close.emit();
  }

  onSubmit(): void {
    this.submitted.set(true);

    if (!this.inspectionDate()) return;
    if (!this.status()) return;

    const payload: AddInventoryInspectionPayload = {
      inspectionDate: this.inspectionDate(),
      status: this.status(),
      condition: this.condition() || undefined,
      findings: this.findings().trim(),
      actionsRequired: this.actionsRequired().trim(),
      nextInspectionDate: this.nextInspectionDate() || null,
      zone: this.zone() || null,
      notes: this.notes().trim(),
    };

    this.save.emit(payload);
  }

  getZoneLabel(zone: InspectionZoneOption): string {
    if (zone.code?.trim()) {
      return `${zone.name} (${zone.code})`;
    }

    return zone.name;
  }

  getItemZoneLabel(): string {
    if (!this.item?.zone) {
      return '—';
    }

    if (typeof this.item.zone === 'string') {
      const found = this.zones.find((zone) => zone._id === this.item?.zone);
      return found?.name || this.item.zone;
    }

    return this.item.zone?.name || '—';
  }

  private resetForm(): void {
    this.submitted.set(false);
    this.inspectionDate.set(this.todayInputDate());
    this.status.set('ok');
    this.condition.set((this.item?.condition as InspectionCondition) || '');
    this.zone.set(this.resolveZoneId(this.item?.zone));
    this.findings.set('');
    this.actionsRequired.set('');
    this.nextInspectionDate.set(this.toDateInput(this.item?.nextInspectionDate));
    this.notes.set('');
  }

  private resolveZoneId(
    zone: string | { _id?: string; name?: string } | null | undefined
  ): string {
    if (!zone) return '';
    if (typeof zone === 'string') return zone;
    return zone._id || '';
  }

  private todayInputDate(): string {
    return this.toDateInput(new Date());
  }

  private toDateInput(value: string | Date | null | undefined): string {
    if (!value) return '';

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}