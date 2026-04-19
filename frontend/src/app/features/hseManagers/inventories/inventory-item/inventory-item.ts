import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';

import {
  InventoryAssignment,
  InventoryInspection,
  InventoryItem as InventoryItemModel,
  InventoryMovement,
  InventoryServices,
} from '../../../../core/services/inventory/inventory-services';

import {
  AssignInventoryEmployee,
  AssignInventoryItem,
  AssignInventoryModel,
  AssignInventoryPayload,
} from '../assign-inventory-model/assign-inventory-model';

import {
  Employee,
  EmployeeServices,
} from '../../../../core/services/employees/employee-services';

import {
  AddInventoryMovementModel,
  AddInventoryMovementPayload,
  MovementEmployeeOption,
  MovementInventoryItem,
} from '../add-inventory-movement-model/add-inventory-movement-model';

import {
  AddInventoryInspectionModel,
  AddInventoryInspectionPayload,
  InspectionInventoryItem,
  InspectionZoneOption,
} from '../add-inventory-inspection-model/add-inventory-inspection-model';

import { ZoneServices } from '../../../../core/services/zones/zone-services';

type InventoryTab = 'overview' | 'movements' | 'assignments' | 'inspections';

@Component({
  selector: 'app-inventory-item',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AssignInventoryModel,
    AddInventoryMovementModel,
    AddInventoryInspectionModel,
  ],
  templateUrl: './inventory-item.html',
  styleUrl: './inventory-item.scss',
})
export class InventoryItem {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private inventoryService = inject(InventoryServices);
  private employeeService = inject(EmployeeServices);
  private zoneService = inject(ZoneServices);

  inventoryId = '';
  activeTab = signal<InventoryTab>('overview');

  item = signal<InventoryItemModel | null>(null);
  movements = signal<InventoryMovement[]>([]);
  assignments = signal<InventoryAssignment[]>([]);
  inspections = signal<InventoryInspection[]>([]);

  loading = signal(false);
  loadingRelated = signal(false);
  errorMessage = signal('');

  isAssignModalOpen = signal(false);
  assignSubmitting = signal(false);
  assignErrorMessage = signal('');
  assignEmployees = signal<AssignInventoryEmployee[]>([]);
  currentZoneEmployees = signal<AssignInventoryEmployee[]>([]);

  isMovementModalOpen = signal(false);
  movementSubmitting = signal(false);
  movementErrorMessage = signal('');
  movementEmployees = signal<MovementEmployeeOption[]>([]);

  isInspectionModalOpen = signal(false);
  inspectionSubmitting = signal(false);
  inspectionErrorMessage = signal('');
  inspectionZones = signal<InspectionZoneOption[]>([]);

  summary = computed(() => {
    const currentItem = this.item();

    return {
      movementCount: this.movements().length,
      assignmentCount: this.assignments().length,
      inspectionCount: this.inspections().length,
      hasAlerts:
        !!currentItem &&
        (this.isExpired(currentItem) ||
          this.isLowStock(currentItem) ||
          currentItem.status === 'maintenance' ||
          currentItem.status === 'damaged' ||
          currentItem.status === 'out_of_service'),
    };
  });

  assignModalItem = computed<AssignInventoryItem | null>(() => {
    const currentItem = this.item();

    if (!currentItem) return null;

    return {
      _id: currentItem._id,
      name: currentItem.name,
      inventoryCode: currentItem.inventoryCode,
      category: currentItem.category,
      subCategory: currentItem.subCategory,
      status: currentItem.status,
      zone: currentItem.zone,
      quantity: currentItem.quantity,
      unit: currentItem.unit,
    };
  });

  movementModalItem = computed<MovementInventoryItem | null>(() => {
    const currentItem = this.item();

    if (!currentItem) return null;

    return {
      _id: currentItem._id,
      name: currentItem.name,
      inventoryCode: currentItem.inventoryCode,
      category: currentItem.category,
      subCategory: currentItem.subCategory,
      status: currentItem.status,
      quantity: currentItem.quantity,
      unit: currentItem.unit,
    };
  });

  inspectionModalItem = computed<InspectionInventoryItem | null>(() => {
    const currentItem = this.item();

    if (!currentItem) return null;

    return {
      _id: currentItem._id,
      name: currentItem.name,
      inventoryCode: currentItem.inventoryCode,
      category: currentItem.category,
      subCategory: currentItem.subCategory,
      status: currentItem.status,
      condition: typeof currentItem.condition === 'string' ? currentItem.condition : '',
      quantity: currentItem.quantity,
      unit: currentItem.unit,
      zone: currentItem.zone,
      nextInspectionDate: currentItem.nextInspectionDate || null,
    };
  });

  constructor() {
    this.inventoryId = this.route.snapshot.paramMap.get('id') || '';

    if (!this.inventoryId) {
      this.errorMessage.set("Identifiant de l'élément introuvable.");
      return;
    }

    this.loadItem();
    this.loadRelatedData();
    this.loadAllEmployees();
    this.loadZones();
  }

  setTab(tab: InventoryTab): void {
    this.activeTab.set(tab);
  }

  loadItem(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.inventoryService
      .getInventoryItemById(this.inventoryId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.item.set(response.item);
          this.loadEmployeesForCurrentZone();
        },
        error: (error) => {
          const message =
            error?.error?.message ||
            "Impossible de charger l'élément d'inventaire.";
          this.errorMessage.set(message);
        },
      });
  }

  loadRelatedData(): void {
    this.loadingRelated.set(true);

    let doneCount = 0;

    const done = () => {
      doneCount += 1;
      if (doneCount === 3) {
        this.loadingRelated.set(false);
      }
    };

    this.inventoryService
      .getInventoryMovements({
        inventoryItem: this.inventoryId,
        limit: 50,
        sortBy: 'createdAt',
        order: 'desc',
      })
      .subscribe({
        next: (response) => {
          this.movements.set(response.movements || []);
          done();
        },
        error: () => {
          this.movements.set([]);
          done();
        },
      });

    this.inventoryService
      .getInventoryAssignments({
        inventoryItem: this.inventoryId,
        limit: 50,
        sortBy: 'createdAt',
        order: 'desc',
      })
      .subscribe({
        next: (response) => {
          this.assignments.set(response.assignments || []);
          done();
        },
        error: () => {
          this.assignments.set([]);
          done();
        },
      });

    this.inventoryService
      .getInventoryInspections({
        inventoryItem: this.inventoryId,
        limit: 50,
        sortBy: 'createdAt',
        order: 'desc',
      })
      .subscribe({
        next: (response) => {
          this.inspections.set(response.inspections || []);
          done();
        },
        error: () => {
          this.inspections.set([]);
          done();
        },
      });
  }

  loadAllEmployees(): void {
    this.employeeService.getAllEmployees({ isActive: true }).subscribe({
      next: (response: any) => {
        const mapped = this.normalizeEmployeesResponse(response);
        this.assignEmployees.set(mapped);
        this.movementEmployees.set(this.mapMovementEmployeesFromAssign(mapped));
      },
      error: () => {
        this.assignEmployees.set([]);
        this.movementEmployees.set([]);
      },
    });
  }

  loadEmployeesForCurrentZone(): void {
    const currentItem = this.item();
    const zoneId = this.getZoneId(currentItem?.zone);

    if (!zoneId) {
      this.currentZoneEmployees.set([]);
      return;
    }

    this.employeeService.getEmployeesByZone(zoneId).subscribe({
      next: (employees: Employee[]) => {
        this.currentZoneEmployees.set(this.mapEmployees(employees));
      },
      error: () => {
        this.currentZoneEmployees.set([]);
      },
    });
  }

  loadZones(): void {
    this.zoneService.getAllZones().subscribe({
      next: (response: any) => {
        const list = response?.zones || response?.items || response?.data || [];

        const mapped: InspectionZoneOption[] = (list || []).map((zone: any) => ({
          _id: zone._id || '',
          name: zone.name || 'Zone',
          code: zone.code || '',
        }));

        this.inspectionZones.set(mapped);
      },
      error: () => {
        this.inspectionZones.set([]);
      },
    });
  }

  refreshAll(): void {
    this.loadItem();
    this.loadRelatedData();
  }

  goBack(): void {
    this.router.navigate(['/manager/inventories']);
  }

  editItem(): void {
    if (!this.inventoryId) return;
    this.router.navigate(['/manager/inventories/edit', this.inventoryId]);
  }

  addMovement(): void {
    this.movementErrorMessage.set('');
    this.isMovementModalOpen.set(true);
  }

  closeMovementModal(): void {
    if (this.movementSubmitting()) return;
    this.isMovementModalOpen.set(false);
    this.movementErrorMessage.set('');
  }

  submitMovement(payload: AddInventoryMovementPayload): void {
    const currentItem = this.item();

    if (!currentItem?._id) {
      this.movementErrorMessage.set("Élément d'inventaire introuvable.");
      return;
    }

    this.movementSubmitting.set(true);
    this.movementErrorMessage.set('');

    this.inventoryService
      .createInventoryMovement({
        inventoryItem: currentItem._id,
        movementType: payload.movementType,
        quantity: payload.quantity,
        unit: payload.unit,
        employee: payload.employee || null,
        reason: payload.reason || '',
        reference: payload.reference || '',
        notes: payload.notes || '',
      })
      .pipe(finalize(() => this.movementSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.isMovementModalOpen.set(false);
          this.loadItem();
          this.loadRelatedData();
          this.activeTab.set('movements');
        },
        error: (error) => {
          this.movementErrorMessage.set(
            error?.error?.message || 'Impossible de créer le mouvement.'
          );
        },
      });
  }

  addAssignment(): void {
    this.assignErrorMessage.set('');
    this.isAssignModalOpen.set(true);
  }

  closeAssignModal(): void {
    if (this.assignSubmitting()) return;
    this.isAssignModalOpen.set(false);
    this.assignErrorMessage.set('');
  }

  submitAssignment(payload: AssignInventoryPayload): void {
    const currentItem = this.item();

    if (!currentItem?._id) {
      this.assignErrorMessage.set("Élément d'inventaire introuvable.");
      return;
    }

    if (payload.strategy === 'individual') {
      if (!payload.employee) {
        this.assignErrorMessage.set('Veuillez sélectionner un employé.');
        return;
      }

      this.assignSubmitting.set(true);
      this.assignErrorMessage.set('');

      this.inventoryService
        .createInventoryAssignment({
          inventoryItem: currentItem._id,
          employee: payload.employee,
          assignmentType: payload.assignmentType,
          expectedReturnDate: payload.expectedReturnDate || null,
          notes: payload.note || '',
          zone: this.getZoneId(currentItem.zone) || null,
          metadata: {
            assignedAt: payload.assignedAt,
            strategy: payload.strategy,
          },
        })
        .pipe(finalize(() => this.assignSubmitting.set(false)))
        .subscribe({
          next: () => {
            this.isAssignModalOpen.set(false);
            this.loadItem();
            this.loadRelatedData();
            this.activeTab.set('assignments');
          },
          error: (error) => {
            const message =
              error?.error?.message ||
              "Impossible d'enregistrer l'affectation.";
            this.assignErrorMessage.set(message);
          },
        });

      return;
    }

    if (payload.strategy === 'all_current_zone_employees') {
      const employees = this.currentZoneEmployees().filter(
        (employee) => employee.isActive !== false && !!employee._id
      );

      if (employees.length === 0) {
        this.assignErrorMessage.set(
          'Aucun employé actif trouvé dans la zone actuelle.'
        );
        return;
      }

      this.assignSubmitting.set(true);
      this.assignErrorMessage.set('');

      const requests = employees.map((employee) =>
        this.inventoryService.createInventoryAssignment({
          inventoryItem: currentItem._id,
          employee: employee._id,
          assignmentType: payload.assignmentType,
          expectedReturnDate: payload.expectedReturnDate || null,
          notes: payload.note || '',
          zone: this.getZoneId(currentItem.zone) || null,
          metadata: {
            assignedAt: payload.assignedAt,
            strategy: payload.strategy,
            zoneBulkAssignment: true,
          },
        })
      );

      forkJoin(requests)
        .pipe(finalize(() => this.assignSubmitting.set(false)))
        .subscribe({
          next: () => {
            this.isAssignModalOpen.set(false);
            this.loadItem();
            this.loadRelatedData();
            this.activeTab.set('assignments');
          },
          error: (error) => {
            const message =
              error?.error?.message ||
              "Impossible d'enregistrer les affectations de zone.";
            this.assignErrorMessage.set(message);
          },
        });
    }
  }

  addInspection(): void {
    this.inspectionErrorMessage.set('');
    this.isInspectionModalOpen.set(true);
  }

  closeInspectionModal(): void {
    if (this.inspectionSubmitting()) return;
    this.isInspectionModalOpen.set(false);
    this.inspectionErrorMessage.set('');
  }

  submitInspection(payload: AddInventoryInspectionPayload): void {
    const currentItem = this.item();

    if (!currentItem?._id) {
      this.inspectionErrorMessage.set("Élément d'inventaire introuvable.");
      return;
    }

    this.inspectionSubmitting.set(true);
    this.inspectionErrorMessage.set('');

    this.inventoryService
      .createInventoryInspection({
        inventoryItem: currentItem._id,
        inspectionDate: payload.inspectionDate || undefined,
        result: this.mapInspectionStatusToResult(payload.status),
        status: payload.status,
        condition: payload.condition || undefined,
        findings: payload.findings?.trim() || '',
        actionsRequired: payload.actionsRequired?.trim() || '',
        nextInspectionDate: payload.nextInspectionDate || null,
        zone: payload.zone || this.getZoneId(currentItem.zone) || null,
        notes: payload.notes?.trim() || '',
        metadata: {
          source: 'inventory-item-modal',
        },
      })
      .pipe(finalize(() => this.inspectionSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.isInspectionModalOpen.set(false);
          this.loadItem();
          this.loadRelatedData();
          this.activeTab.set('inspections');
        },
        error: (error) => {
          this.inspectionErrorMessage.set(
            error?.error?.message ||
              "Impossible d'enregistrer l'inspection."
          );
        },
      });
  }

  private normalizeEmployeesResponse(response: any): AssignInventoryEmployee[] {
    const list =
      response?.employees ||
      response?.items ||
      response?.data ||
      response?.results ||
      [];

    return this.mapEmployees(list);
  }

  private mapEmployees(employees: Employee[] = []): AssignInventoryEmployee[] {
    return (employees || []).map((employee) => ({
      _id: employee._id || '',
      fullName: employee.fullName || 'Employé',
      employeeId: employee.employeeId || null,
      department: employee.department || null,
      jobTitle: employee.jobTitle || null,
      zone: employee.zone || null,
      isActive: employee.isActive,
    }));
  }

  private mapMovementEmployeesFromAssign(
    employees: AssignInventoryEmployee[]
  ): MovementEmployeeOption[] {
    return employees.map((employee) => ({
      _id: employee._id,
      fullName: employee.fullName || 'Employé',
      employeeId: employee.employeeId || null,
      department: employee.department || null,
      jobTitle: employee.jobTitle || null,
      isActive: employee.isActive,
    }));
  }

  private mapInspectionStatusToResult(
    status: AddInventoryInspectionPayload['status']
  ): 'pass' | 'fail' | 'warning' {
    switch (status) {
      case 'ok':
        return 'pass';
      case 'issue_found':
        return 'fail';
      case 'pending':
        return 'warning';
      default:
        return 'warning';
    }
  }

  private getZoneId(
    zone:
      | InventoryItemModel['zone']
      | string
      | { _id?: string; name?: string }
      | null
      | undefined
  ): string {
    if (!zone) return '';
    return typeof zone === 'string' ? zone : zone._id || '';
  }

  getCategoryLabel(category?: string): string {
    switch (category) {
      case 'ppe':
        return 'EPI';
      case 'extinguisher':
        return 'Extincteur';
      case 'medical':
        return 'Médical';
      case 'tool':
        return 'Outil';
      case 'signage':
        return 'Signalisation';
      case 'other':
        return 'Autre';
      default:
        return category || '—';
    }
  }

  getStatusLabel(status?: string): string {
    switch (status) {
      case 'available':
        return 'Disponible';
      case 'assigned':
        return 'Affecté';
      case 'in_stock':
        return 'En stock';
      case 'low_stock':
        return 'Stock faible';
      case 'maintenance':
        return 'Maintenance';
      case 'expired':
        return 'Expiré';
      case 'damaged':
        return 'Endommagé';
      case 'lost':
        return 'Perdu';
      case 'out_of_service':
        return 'Hors service';
      default:
        return status || '—';
    }
  }

  getConditionLabel(condition?: string): string {
    switch (condition) {
      case 'new':
        return 'Neuf';
      case 'good':
        return 'Bon';
      case 'fair':
        return 'Moyen';
      case 'poor':
        return 'Faible';
      case 'damaged':
        return 'Endommagé';
      case 'expired':
        return 'Expiré';
      default:
        return condition || '—';
    }
  }

  getStatusClass(status?: string): string {
    switch (status) {
      case 'available':
      case 'in_stock':
        return 'success';
      case 'low_stock':
      case 'maintenance':
        return 'warning';
      case 'expired':
      case 'damaged':
      case 'lost':
      case 'out_of_service':
        return 'danger';
      case 'assigned':
        return 'info';
      default:
        return 'neutral';
    }
  }

  getMovementTypeLabel(type?: string): string {
    switch (type) {
      case 'in':
        return 'Entrée';
      case 'out':
        return 'Sortie';
      case 'assignment':
        return 'Affectation';
      case 'return':
        return 'Retour';
      case 'transfer':
        return 'Transfert';
      case 'adjustment':
        return 'Ajustement';
      case 'maintenance_out':
        return 'Sortie maintenance';
      case 'maintenance_in':
        return 'Retour maintenance';
      case 'inspection':
        return 'Inspection';
      case 'loss':
        return 'Perte';
      case 'damage':
        return 'Dommage';
      case 'archive':
        return 'Archivage';
      default:
        return type || '—';
    }
  }

  getAssignmentStatusLabel(status?: string): string {
    switch (status) {
      case 'active':
        return 'Active';
      case 'returned':
        return 'Retournée';
      case 'overdue':
        return 'En retard';
      case 'cancelled':
        return 'Annulée';
      default:
        return status || '—';
    }
  }

  getAssignmentTypeLabel(type?: string): string {
    switch (type) {
      case 'individual':
        return 'Individuelle';
      case 'zone':
        return 'Zone';
      case 'temporary':
        return 'Temporaire';
      case 'permanent':
        return 'Permanente';
      default:
        return type || '—';
    }
  }

  getInspectionStatusLabel(status?: string): string {
    switch (status) {
      case 'ok':
      case 'pass':
        return 'Conforme';

      case 'issue_found':
      case 'fail':
        return 'Anomalie';

      case 'pending':
      case 'warning':
        return 'En attente';

      case 'not_applicable':
        return 'Non applicable';

      default:
        return status || '—';
    }
  }

  formatDate(value?: string | null): string {
    if (!value) return '—';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';

    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  }

  getCompanyName(item: InventoryItemModel | null): string {
    if (!item?.company) return '—';
    return typeof item.company === 'string'
      ? item.company
      : item.company.name || '—';
  }

  getZoneName(
    value:
      | InventoryItemModel['zone']
      | InventoryMovement['fromZone']
      | InventoryMovement['toZone']
      | InventoryAssignment['zone']
      | InventoryInspection['zone']
  ): string {
    if (!value) return '—';
    return typeof value === 'string' ? value : value.name || '—';
  }

  getAssignedToName(item: InventoryItemModel | null): string {
    if (!item?.assignedTo) return '—';

    if (typeof item.assignedTo === 'string') return item.assignedTo;

    const assignedLike = item.assignedTo as any;
    const firstName = assignedLike.firstName || '';
    const lastName = assignedLike.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim();

    return fullName || assignedLike.email || '—';
  }

  getEmployeeName(
    value: InventoryAssignment['employee'] | InventoryMovement['employee']
  ): string {
    if (!value) return '—';

    if (typeof value === 'string') return value;

    const employeeLike = value as any;

    if (employeeLike.fullName) {
      return employeeLike.fullName;
    }

    const firstName = employeeLike.firstName || '';
    const lastName = employeeLike.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim();

    return fullName || employeeLike.email || '—';
  }

  getUserName(
    value:
      | InventoryInspection['inspectedBy']
      | InventoryAssignment['assignedBy']
      | InventoryAssignment['returnedBy']
      | InventoryMovement['createdBy']
  ): string {
    if (!value) return '—';
    if (typeof value === 'string') return value;

    const userLike = value as any;
    const firstName = userLike.firstName || '';
    const lastName = userLike.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim();

    return fullName || userLike.email || '—';
  }

  getInspectionDate(inspection: InventoryInspection): string {
    return inspection.inspectionDate || inspection.createdAt || '';
  }

  getInspectionStatusValue(inspection: InventoryInspection): string {
    return inspection.result || inspection.status || '';
  }

  getInspectionCondition(inspection: InventoryInspection): string {
    return inspection.condition || '';
  }

  getInspectionNextDate(inspection: InventoryInspection): string | null {
    return inspection.nextInspectionDate || null;
  }

  hasImage(item: InventoryItemModel | null): boolean {
    return !!item?.imageUrl;
  }

  isExpired(item: InventoryItemModel): boolean {
    if (!item.expiryDate) return false;
    return new Date(item.expiryDate).getTime() < Date.now();
  }

  isLowStock(item: InventoryItemModel): boolean {
    if (item.category === 'extinguisher') return false;

    const quantity = item.quantity ?? 0;
    const minStockLevel = item.minStockLevel ?? 0;

    return quantity <= minStockLevel;
  }

  trackMovement(_: number, movement: InventoryMovement): string {
    return movement._id;
  }

  trackAssignment(_: number, assignment: InventoryAssignment): string {
    return assignment._id;
  }

  trackInspection(_: number, inspection: InventoryInspection): string {
    return inspection._id;
  }
}