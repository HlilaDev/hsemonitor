import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import {
  InventoryAssignment,
  InventoryItem,
  InventoryServices,
} from '../../../../core/services/inventory/inventory-services';

@Component({
  selector: 'app-inventories-overview',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './inventories-overview.html',
  styleUrl: './inventories-overview.scss',
})
export class InventoriesOverview {
  private inventoryService = inject(InventoryServices);

  q = signal('');
  categoryFilter = signal('');
  statusFilter = signal('');
  onlyAlerts = signal(false);
  currentPage = signal(1);
  pageSize = signal(8);

  loading = signal(false);
  errorMessage = signal('');
  viewMode = signal<'grid' | 'table'>('table');

  inventories = signal<InventoryItem[]>([]);
  assignments = signal<InventoryAssignment[]>([]);

  categories = [
    { value: '', label: 'Toutes catégories' },
    { value: 'ppe', label: 'EPI' },
    { value: 'extinguisher', label: 'Extincteurs' },
    { value: 'medical', label: 'Médical' },
    { value: 'tool', label: 'Outils' },
    { value: 'signage', label: 'Signalisation' },
    { value: 'other', label: 'Autres' },
  ];

  statuses = [
    { value: '', label: 'Tous statuts' },
    { value: 'available', label: 'Disponible' },
    { value: 'assigned', label: 'Affecté' },
    { value: 'in_stock', label: 'En stock' },
    { value: 'low_stock', label: 'Stock faible' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'expired', label: 'Expiré' },
    { value: 'damaged', label: 'Endommagé' },
    { value: 'lost', label: 'Perdu' },
    { value: 'out_of_service', label: 'Hors service' },
  ];

  assignmentNameMap = computed(() => {
    const map = new Map<string, string>();
    const grouped = new Map<string, InventoryAssignment[]>();

    for (const assignment of this.assignments()) {
      const itemId = this.getInventoryItemId(assignment.inventoryItem);
      if (!itemId) continue;

      if (!grouped.has(itemId)) grouped.set(itemId, []);
      grouped.get(itemId)!.push(assignment);
    }

    for (const [itemId, itemAssignments] of grouped.entries()) {
      const sorted = [...itemAssignments].sort((a, b) => {
        const aDate = new Date(a.assignedAt || a.createdAt || 0).getTime();
        const bDate = new Date(b.assignedAt || b.createdAt || 0).getTime();
        return bDate - aDate;
      });

      const activeAssignment =
        sorted.find((assignment) => assignment.status === 'active') || sorted[0];

      const employeeName = this.getAssignmentEmployeeName(activeAssignment);
      if (employeeName !== '-') map.set(itemId, employeeName);
    }

    return map;
  });

  filteredInventories = computed(() => {
    const search = this.q().trim().toLowerCase();
    const category = this.categoryFilter();
    const status = this.statusFilter();
    const alertsOnly = this.onlyAlerts();

    return this.inventories().filter((item) => {
      const zoneName = this.getZoneName(item.zone).toLowerCase();
      const assignedName = this.getAssignedDisplayName(item).toLowerCase();

      const matchesSearch =
        !search ||
        (item.name || '').toLowerCase().includes(search) ||
        (item.inventoryCode || '').toLowerCase().includes(search) ||
        (item.subCategory || '').toLowerCase().includes(search) ||
        (item.brand || '').toLowerCase().includes(search) ||
        (item.model || '').toLowerCase().includes(search) ||
        (item.serialNumber || '').toLowerCase().includes(search) ||
        zoneName.includes(search) ||
        assignedName.includes(search);

      const matchesCategory = !category || item.category === category;
      const matchesStatus = !status || item.status === status;

      const isAlert =
        this.isLowStock(item) ||
        this.isExpired(item) ||
        this.isNearInspection(item) ||
        this.isNearMaintenance(item) ||
        item.status === 'maintenance' ||
        item.status === 'damaged' ||
        item.status === 'out_of_service';

      return matchesSearch && matchesCategory && matchesStatus && (!alertsOnly || isAlert);
    });
  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredInventories().length / this.pageSize()))
  );

  paginatedInventories = computed(() => {
    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    return this.filteredInventories().slice(start, start + size);
  });

  stats = computed(() => {
    const items = this.inventories();

    return {
      totalItems: items.length,
      totalQuantity: items.reduce((sum, item) => sum + (item.quantity || 0), 0),
      lowStock: items.filter((item) => this.isLowStock(item)).length,
      expired: items.filter((item) => this.isExpired(item)).length,
      assigned: items.filter((item) => item.status === 'assigned').length,
      maintenance: items.filter((item) => item.status === 'maintenance').length,
    };
  });

  constructor() {
    this.loadInventories();
    this.loadAssignments();
  }

  loadInventories(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.inventoryService
      .getInventoryItems({
        limit: 200,
        sortBy: 'createdAt',
        order: 'desc',
      })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.inventories.set(response.items || []);
        },
        error: (error) => {
          this.errorMessage.set(
            error?.error?.message || 'Impossible de charger les inventaires.'
          );
          this.inventories.set([]);
        },
      });
  }

  loadAssignments(): void {
    this.inventoryService
      .getInventoryAssignments({
        limit: 500,
        sortBy: 'createdAt',
        order: 'desc',
      })
      .subscribe({
        next: (response) => {
          this.assignments.set(response.assignments || []);
        },
        error: () => {
          this.assignments.set([]);
        },
      });
  }

  setViewMode(mode: 'grid' | 'table'): void {
    this.viewMode.set(mode);
  }

  resetFilters(): void {
    this.q.set('');
    this.categoryFilter.set('');
    this.statusFilter.set('');
    this.onlyAlerts.set(false);
    this.currentPage.set(1);
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
  }

  onFilterChange(): void {
    this.currentPage.set(1);
  }

  refresh(): void {
    this.currentPage.set(1);
    this.loadInventories();
    this.loadAssignments();
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  }

  getCategoryLabel(category: string): string {
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
        return category || '-';
    }
  }

  getStatusLabel(status: string): string {
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
        return status || '-';
    }
  }

  getConditionLabel(condition: string): string {
    switch (condition) {
      case 'new':
        return 'Neuf';
      case 'good':
        return 'Bon';
      case 'fair':
        return 'Moyen';
      case 'poor':
        return 'Mauvais';
      case 'damaged':
        return 'Endommagé';
      default:
        return condition || '-';
    }
  }

  getZoneName(zone: any): string {
    if (!zone) return '-';
    if (typeof zone === 'string') return zone;
    return zone.name || zone.label || zone.code || '-';
  }

  getAssignedDisplayName(item: InventoryItem): string {
    const itemId = this.getInventoryItemId(item);
    if (itemId && this.assignmentNameMap().has(itemId)) {
      return this.assignmentNameMap().get(itemId) || '-';
    }

    const assignedTo = (item as any).assignedTo || (item as any).assignedUser || (item as any).employee;
    if (!assignedTo) return '-';

    if (typeof assignedTo === 'string') return assignedTo;

    const fullName = [assignedTo.firstName, assignedTo.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();

    return fullName || assignedTo.name || assignedTo.email || '-';
  }

  getInventoryItemId(value: any): string {
    if (!value) return '';
    if (typeof value === 'string') return value;
    return value._id || value.id || '';
  }

  getAssignmentEmployeeName(assignment: InventoryAssignment | undefined): string {
    if (!assignment) return '-';

    const employee =
      (assignment as any).employee ||
      (assignment as any).assignedTo ||
      (assignment as any).user ||
      (assignment as any).beneficiary;

    if (!employee) return '-';
    if (typeof employee === 'string') return employee;

    const fullName = [employee.firstName, employee.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();

    return fullName || employee.name || employee.email || '-';
  }

  isLowStock(item: InventoryItem): boolean {
    const quantity = item.quantity || 0;
    const minQuantity =
      (item as any).minQuantity ??
      (item as any).minimumQuantity ??
      (item as any).reorderLevel ??
      (item as any).alertThreshold ??
      0;

    return item.status === 'low_stock' || (!!minQuantity && quantity <= minQuantity);
  }

  isExpired(item: InventoryItem): boolean {
    const expiryDate =
      (item as any).expiryDate ||
      (item as any).expirationDate ||
      (item as any).validUntil;

    if (item.status === 'expired') return true;
    if (!expiryDate) return false;

    return new Date(expiryDate).getTime() < Date.now();
  }

  isNearInspection(item: InventoryItem): boolean {
    const date = (item as any).nextInspectionDate || (item as any).inspectionDueDate;
    return this.isDateNear(date, 30);
  }

  isNearMaintenance(item: InventoryItem): boolean {
    const date = (item as any).nextMaintenanceDate || (item as any).maintenanceDueDate;
    return this.isDateNear(date, 30);
  }

  isDateNear(value: string | Date | undefined, days = 30): boolean {
    if (!value) return false;

    const target = new Date(value).getTime();
    if (Number.isNaN(target)) return false;

    const now = Date.now();
    const limit = now + days * 24 * 60 * 60 * 1000;
    return target >= now && target <= limit;
  }

  trackById(index: number, item: InventoryItem): string | number {
    return item._id || (item as any).id || index;
  }
}
