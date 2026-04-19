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

      if (!grouped.has(itemId)) {
        grouped.set(itemId, []);
      }

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
      if (employeeName !== '-') {
        map.set(itemId, employeeName);
      }
    }

    return map;
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
        item.status === 'maintenance' ||
        item.status === 'damaged' ||
        item.status === 'out_of_service';

      return matchesSearch && matchesCategory && matchesStatus && (!alertsOnly || isAlert);
    });
  });

  totalPages = computed(() => {
    return Math.max(1, Math.ceil(this.filteredInventories().length / this.pageSize()));
  });

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
      default:
        return 'Autre';
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
        return status;
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
        return 'Faible';
      case 'damaged':
        return 'Endommagé';
      default:
        return condition;
    }
  }

  getZoneName(zone: InventoryItem['zone']): string {
    if (!zone) return '-';
    if (typeof zone === 'string') return zone;
    return zone.name || '-';
  }

  getAssignedToName(assignedTo: InventoryItem['assignedTo']): string {
    if (!assignedTo) return '-';
    if (typeof assignedTo === 'string') return assignedTo;

    const firstName = assignedTo.firstName || '';
    const lastName = assignedTo.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim();

    return fullName || assignedTo.email || '-';
  }

  getAssignmentEmployeeName(value: InventoryAssignment | null | undefined): string {
    if (!value?.employee) return '-';

    if (typeof value.employee === 'string') return value.employee;

    const firstName = value.employee.firstName || '';
    const lastName = value.employee.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim();

    return fullName || value.employee.email || '-';
  }

  getAssignedDisplayName(item: InventoryItem): string {
    const directName = this.getAssignedToName(item.assignedTo);

    if (directName !== '-') {
      return directName;
    }

    return this.assignmentNameMap().get(item._id) || '-';
  }

  getInventoryItemId(value: InventoryAssignment['inventoryItem']): string {
    if (!value) return '';
    return typeof value === 'string' ? value : value._id || '';
  }

  isExpired(item: InventoryItem): boolean {
    if (!item.expiryDate) return false;
    return new Date(item.expiryDate).getTime() < Date.now();
  }

  isLowStock(item: InventoryItem): boolean {
    if (item.category === 'extinguisher') return false;
    return (item.quantity || 0) <= (item.minStockLevel || 0);
  }

  isNearInspection(item: InventoryItem): boolean {
    if (!item.nextInspectionDate) return false;

    const diff = new Date(item.nextInspectionDate).getTime() - Date.now();
    const days = diff / (1000 * 60 * 60 * 24);

    return days >= 0 && days <= 15;
  }

  isNearMaintenance(item: InventoryItem): boolean {
    if (!item.nextMaintenanceDate) return false;

    const diff = new Date(item.nextMaintenanceDate).getTime() - Date.now();
    const days = diff / (1000 * 60 * 60 * 24);

    return days >= 0 && days <= 15;
  }

  trackById(_: number, item: InventoryItem): string {
    return item._id;
  }
}