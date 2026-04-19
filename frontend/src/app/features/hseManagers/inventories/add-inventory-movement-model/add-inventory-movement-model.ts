import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Zone, ZoneServices } from '../../../../core/services/zones/zone-services';
import { AuthServices } from '../../../../core/services/auth/auth-services';

export interface MovementEmployeeOption {
  _id: string;
  fullName: string;
  employeeId?: string | null;
  department?: string | null;
  jobTitle?: string | null;
  isActive?: boolean;
  zone?: string | { _id: string; name?: string } | null;
}

export interface MovementInventoryItem {
  _id: string;
  name: string;
  inventoryCode?: string;
  category?: string;
  subCategory?: string;
  status?: string;
  quantity?: number;
  unit?: string;
  zone?: string | { _id: string; name?: string } | null;
}

export interface MovementZoneOption {
  _id: string;
  name: string;
  code?: string;
}

export type MovementType =
  | 'in'
  | 'out'
  | 'assignment'
  | 'return'
  | 'transfer'
  | 'adjustment'
  | 'maintenance_out'
  | 'maintenance_in'
  | 'inspection'
  | 'loss'
  | 'damage'
  | 'archive';

export interface AddInventoryMovementPayload {
  movementType: MovementType;
  quantity: number;
  unit?: string;
  employee?: string | null;
  fromZone?: string | null;
  toZone?: string | null;
  reason?: string;
  reference?: string;
  notes?: string;
}

@Component({
  selector: 'app-add-inventory-movement-model',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-inventory-movement-model.html',
  styleUrl: './add-inventory-movement-model.scss',
})
export class AddInventoryMovementModel implements OnInit {
  private zoneService = inject(ZoneServices);
  private authService = inject(AuthServices);

  private _open = false;
  private _item: MovementInventoryItem | null = null;
  private _employees: MovementEmployeeOption[] = [];

  @Input()
  set open(value: boolean) {
    this._open = value;
    console.log('[MovementModal] open =', value);

    if (value) {
      this.resetForm();
      this.bootstrapZones();
    }
  }
  get open(): boolean {
    return this._open;
  }

  @Input()
  set item(value: MovementInventoryItem | null) {
    this._item = value;
    this.unit.set(value?.unit?.trim() || 'piece');
  }
  get item(): MovementInventoryItem | null {
    return this._item;
  }

  @Input()
  set employees(value: MovementEmployeeOption[]) {
    this._employees = Array.isArray(value) ? value : [];
    this.buildZonesFromEmployeesAndItem();
  }
  get employees(): MovementEmployeeOption[] {
    return this._employees;
  }

  @Input() loading = false;
  @Input() errorMessage = '';

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<AddInventoryMovementPayload>();

  submitted = signal(false);

  zones = signal<MovementZoneOption[]>([]);
  zonesLoading = signal(false);
  zonesErrorMessage = signal('');
  zonesSource = signal('Aucune zone chargée');

  movementType = signal<MovementType>('damage');
  quantity = signal(1);
  unit = signal('piece');
  employee = signal('');
  fromZone = signal('');
  toZone = signal('');
  reason = signal('');
  reference = signal('');
  notes = signal('');

  movementTypes: ReadonlyArray<{ value: MovementType; label: string }> = [
    { value: 'in', label: 'Entrée' },
    { value: 'out', label: 'Sortie' },
    { value: 'assignment', label: 'Affectation' },
    { value: 'return', label: 'Retour' },
    { value: 'transfer', label: 'Transfert' },
    { value: 'adjustment', label: 'Ajustement' },
    { value: 'maintenance_out', label: 'Sortie maintenance' },
    { value: 'maintenance_in', label: 'Retour maintenance' },
    { value: 'inspection', label: 'Inspection' },
    { value: 'loss', label: 'Perte' },
    { value: 'damage', label: 'Dommage' },
    { value: 'archive', label: 'Archivage' },
  ];

  selectedEmployee = computed(() => {
    return this.employees.find((emp) => emp._id === this.employee()) || null;
  });

  selectedFromZone = computed(() => {
    return this.zones().find((zone) => zone._id === this.fromZone()) || null;
  });

  selectedToZone = computed(() => {
    return this.zones().find((zone) => zone._id === this.toZone()) || null;
  });

  ngOnInit(): void {
    console.log('[MovementModal] ngOnInit');
    this.bootstrapZones();
  }

  bootstrapZones(): void {
    this.buildZonesFromEmployeesAndItem();
    this.loadZonesFromApi();
  }

  buildZonesFromEmployeesAndItem(): void {
    const collected: MovementZoneOption[] = [];

    const itemZone = this.toZoneOption(this.item?.zone);
    if (itemZone) {
      collected.push(itemZone);
    }

    for (const employee of this.employees) {
      const employeeZone = this.toZoneOption(employee.zone);
      if (employeeZone) {
        collected.push(employeeZone);
      }
    }

    const merged = this.mergeUniqueZones(this.zones(), collected);
    this.zones.set(merged);

    if (merged.length > 0) {
      this.zonesSource.set(`Zones depuis employés/article: ${merged.length}`);
    }

    const itemZoneId = this.resolveZoneId(this.item?.zone);
    if (itemZoneId && !this.fromZone()) {
      this.fromZone.set(itemZoneId);
    }

    console.log('[MovementModal] zones from employees/item =', merged);
  }

  loadZonesFromApi(): void {
    this.zonesLoading.set(true);
    this.zonesErrorMessage.set('');

    this.authService.me().subscribe({
      next: (meRes: any) => {
        const company = meRes?.user?.company;
        const companyId =
          typeof company === 'string' ? company : company?._id || '';

        console.log('[MovementModal] companyId =', companyId);

        if (!companyId) {
          this.zonesLoading.set(false);

          if (this.zones().length === 0) {
            this.zonesErrorMessage.set('Company introuvable pour charger les zones.');
            this.zonesSource.set('Aucune company pour getAllZones');
          }

          return;
        }

        this.zoneService.getAllZones(companyId).subscribe({
          next: (res) => {
            const apiZones = Array.isArray(res?.items) ? res.items : [];

            const normalizedApiZones = apiZones.map((zone) => ({
              _id: zone._id,
              name: zone.name,
              code: zone.code,
            }));

            const merged = this.mergeUniqueZones(this.zones(), normalizedApiZones);
            this.zones.set(merged);
            this.zonesLoading.set(false);
            this.zonesSource.set(`Zones API + employés/article: ${merged.length}`);

            console.log('[MovementModal] zones from API =', normalizedApiZones);
            console.log('[MovementModal] merged zones =', merged);
          },
          error: (error) => {
            console.error('[MovementModal] getAllZones error =', error);
            this.zonesLoading.set(false);

            if (this.zones().length === 0) {
              this.zonesErrorMessage.set(
                error?.error?.message || 'Impossible de charger les zones.'
              );
              this.zonesSource.set('Erreur API zones');
            } else {
              this.zonesSource.set(
                `Zones depuis employés/article seulement: ${this.zones().length}`
              );
            }
          },
        });
      },
      error: (error) => {
        console.error('[MovementModal] me() error =', error);
        this.zonesLoading.set(false);

        if (this.zones().length === 0) {
          this.zonesErrorMessage.set(
            error?.error?.message || 'Impossible de récupérer la société.'
          );
          this.zonesSource.set('Erreur me()');
        } else {
          this.zonesSource.set(
            `Zones depuis employés/article seulement: ${this.zones().length}`
          );
        }
      },
    });
  }

  mergeUniqueZones(
    current: MovementZoneOption[],
    incoming: MovementZoneOption[]
  ): MovementZoneOption[] {
    const map = new Map<string, MovementZoneOption>();

    for (const zone of current) {
      if (zone?._id) {
        map.set(zone._id, zone);
      }
    }

    for (const zone of incoming) {
      if (zone?._id) {
        map.set(zone._id, zone);
      }
    }

    return Array.from(map.values());
  }

  toZoneOption(
    zone: string | { _id: string; name?: string } | null | undefined
  ): MovementZoneOption | null {
    if (!zone) {
      return null;
    }

    if (typeof zone === 'string') {
      return {
        _id: zone,
        name: zone,
      };
    }

    if (!zone._id) {
      return null;
    }

    return {
      _id: zone._id,
      name: zone.name?.trim() || 'Zone',
    };
  }

  resolveZoneId(
    zone: string | { _id: string; name?: string } | null | undefined
  ): string {
    if (!zone) return '';
    if (typeof zone === 'string') return zone;
    return zone._id || '';
  }

  resolveZoneName(
    zone: string | { _id: string; name?: string } | null | undefined
  ): string {
    if (!zone) return '—';

    if (typeof zone === 'string') {
      const found = this.zones().find((z) => z._id === zone);
      return found?.name || zone;
    }

    return zone.name?.trim() || '—';
  }

  onMovementTypeChange(value: MovementType): void {
    this.movementType.set(value);
  }

  onEmployeeChange(employeeId: string): void {
    this.employee.set(employeeId);

    const employee = this.employees.find((emp) => emp._id === employeeId) || null;
    const employeeZoneId = this.resolveZoneId(employee?.zone);

    console.log('[MovementModal] employee selected =', employee);
    console.log('[MovementModal] employee zone id =', employeeZoneId);

    if (employeeZoneId) {
      this.toZone.set(employeeZoneId);

      const employeeZone = this.toZoneOption(employee?.zone);
      if (employeeZone) {
        this.zones.set(this.mergeUniqueZones(this.zones(), [employeeZone]));
      }
    }
  }

  reloadZones(): void {
    this.bootstrapZones();
  }

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

    if (!this.movementType()) return;
    if (!this.quantity() || this.quantity() <= 0) return;

    const payload: AddInventoryMovementPayload = {
      movementType: this.movementType(),
      quantity: Number(this.quantity()),
      unit: this.unit().trim() || this.item?.unit || 'piece',
      employee: this.employee() || null,
      fromZone: this.fromZone() || null,
      toZone: this.toZone() || null,
      reason: this.reason().trim(),
      reference: this.reference().trim(),
      notes: this.notes().trim(),
    };

    console.log('[MovementModal] submit payload =', payload);
    this.save.emit(payload);
  }

  getEmployeeLabel(employee: MovementEmployeeOption): string {
    let text = employee.fullName || 'Employé';

    if (employee.employeeId) {
      text += ` - ${employee.employeeId}`;
    }

    if (employee.department) {
      text += ` (${employee.department})`;
    }

    return text;
  }

  getZoneLabel(zone: MovementZoneOption): string {
    if (zone.code?.trim()) {
      return `${zone.name} (${zone.code})`;
    }

    return zone.name;
  }

  getItemZoneLabel(): string {
    return this.resolveZoneName(this.item?.zone);
  }

  getEmployeeZoneLabel(): string {
    return this.resolveZoneName(this.selectedEmployee()?.zone);
  }

  resetForm(): void {
    this.submitted.set(false);
    this.movementType.set('damage');
    this.quantity.set(1);
    this.unit.set(this.item?.unit?.trim() || 'piece');
    this.employee.set('');
    this.fromZone.set(this.resolveZoneId(this.item?.zone));
    this.toZone.set('');
    this.reason.set('');
    this.reference.set('');
    this.notes.set('');
  }
}