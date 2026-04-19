import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URLS } from '../../config/api_urls';

export type InventoryCategory =
  | 'ppe'
  | 'extinguisher'
  | 'medical'
  | 'tool'
  | 'signage'
  | 'other';

export type InventoryStatus =
  | 'available'
  | 'assigned'
  | 'in_stock'
  | 'low_stock'
  | 'maintenance'
  | 'expired'
  | 'damaged'
  | 'lost'
  | 'out_of_service';

export type InventoryCondition =
  | 'new'
  | 'good'
  | 'fair'
  | 'poor'
  | 'damaged'
  | 'expired';

export type InventoryAssignmentStatus =
  | 'active'
  | 'returned'
  | 'overdue'
  | 'cancelled';

export type InventoryAssignmentType =
  | 'individual'
  | 'zone'
  | 'temporary'
  | 'permanent';

export type InventoryMovementType =
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

export type InventoryInspectionResult =
  | 'pass'
  | 'fail'
  | 'warning'
  | 'not_applicable';

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ZoneRef {
  _id: string;
  name?: string;
}

export interface UserRef {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface CompanyRef {
  _id: string;
  name?: string;
}

export interface InventoryItem {
  _id: string;
  name: string;
  description?: string;
  category: InventoryCategory | string;
  subCategory?: string;
  inventoryCode?: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  status?: InventoryStatus | string;
  condition?: InventoryCondition | string;
  quantity?: number;
  minStockLevel?: number;
  unit?: string;
  company?: string | CompanyRef;
  zone?: string | ZoneRef | null;
  assignedTo?: string | UserRef | null;
  assignedBy?: string | UserRef | null;
  assignedAt?: string | null;
  locationDescription?: string;
  supplier?: string;
  purchaseDate?: string | null;
  purchasePrice?: number | null;
  warrantyUntil?: string | null;
  manufactureDate?: string | null;
  expiryDate?: string | null;
  lastInspectionDate?: string | null;
  nextInspectionDate?: string | null;
  lastMaintenanceDate?: string | null;
  nextMaintenanceDate?: string | null;
  notes?: string;
  imageUrl?: string;
  attachments?: string[];
  ppeDetails?: Record<string, unknown>;
  extinguisherDetails?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  isActive?: boolean;
  createdBy?: string | UserRef | null;
  updatedBy?: string | UserRef | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface InventoryMovement {
  _id: string;
  inventoryItem: string | InventoryItem;
  company?: string | CompanyRef;
  movementType: InventoryMovementType | string;
  quantity: number;
  unit?: string;
  previousQuantity?: number;
  newQuantity?: number;
  fromZone?: string | ZoneRef | null;
  toZone?: string | ZoneRef | null;
  employee?: string | UserRef | null;
  reason?: string;
  reference?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
  createdBy?: string | UserRef | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface InventoryAssignment {
  _id: string;
  inventoryItem: string | InventoryItem;
  company?: string | CompanyRef;
  employee: string | UserRef;
  assignedBy?: string | UserRef | null;
  returnedBy?: string | UserRef | null;
  assignmentType?: InventoryAssignmentType | string;
  zone?: string | ZoneRef | null;
  assignedAt?: string;
  expectedReturnDate?: string | null;
  returnedAt?: string | null;
  returnCondition?: string;
  status?: InventoryAssignmentStatus | string;
  notes?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface InventoryInspection {
  _id: string;
  inventoryItem: string | InventoryItem;
  company?: string | CompanyRef;
  inspectedBy?: string | UserRef | null;
  zone?: string | ZoneRef | null;
  inspectionDate?: string;
  result?: InventoryInspectionResult | string;
  status?: string;
  condition?: string;
  findings?: string;
  actionsRequired?: string;
  nextInspectionDate?: string | null;
  notes?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface InventoryStats {
  totalItems: number;
  activeItems: number;
  assignedItems: number;
  expiredItems: number;
  lowStockItems: number;
  maintenanceItems: number;
  categoryStats: Array<{
    _id: string;
    count: number;
  }>;
}

export interface InventoryItemsResponse {
  message: string;
  items: InventoryItem[];
  pagination: Pagination;
}

export interface InventoryItemResponse {
  message: string;
  item: InventoryItem;
}

export interface InventoryMovementsResponse {
  message: string;
  movements: InventoryMovement[];
  pagination: Pagination;
}

export interface InventoryMovementResponse {
  message: string;
  movement: InventoryMovement;
  item?: InventoryItem;
}

export interface InventoryAssignmentsResponse {
  message: string;
  assignments: InventoryAssignment[];
  pagination: Pagination;
}

export interface InventoryAssignmentResponse {
  message: string;
  assignment: InventoryAssignment;
  item?: InventoryItem;
}

export interface InventoryInspectionsResponse {
  message: string;
  inspections: InventoryInspection[];
  pagination: Pagination;
}

export interface InventoryInspectionResponse {
  message: string;
  inspection: InventoryInspection;
}

export interface InventoryStatsResponse {
  message: string;
  stats: InventoryStats;
}

export interface InventorySimpleListResponse {
  message: string;
  count: number;
  items: InventoryItem[];
}

export interface InventoryItemFilters {
  q?: string;
  category?: string;
  subCategory?: string;
  status?: string;
  condition?: string;
  zone?: string;
  assignedTo?: string;
  isActive?: boolean | string;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
  company?: string;
}

export interface InventoryMovementFilters {
  inventoryItem?: string;
  movementType?: string;
  employee?: string;
  fromZone?: string;
  toZone?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
  company?: string;
}

export interface InventoryAssignmentFilters {
  inventoryItem?: string;
  employee?: string;
  status?: string;
  assignmentType?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
  company?: string;
}

export interface InventoryInspectionFilters {
  inventoryItem?: string;
  status?: string;
  condition?: string;
  zone?: string;
  inspectedBy?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
  company?: string;
}

export interface CreateInventoryItemDto {
  name: string;
  category: InventoryCategory | string;
  description?: string;
  subCategory?: string;
  inventoryCode?: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  status?: InventoryStatus | string;
  condition?: InventoryCondition | string;
  quantity?: number;
  minStockLevel?: number;
  unit?: string;
  company?: string;
  zone?: string | null;
  assignedTo?: string | null;
  locationDescription?: string;
  supplier?: string;
  purchaseDate?: string | null;
  purchasePrice?: number | null;
  warrantyUntil?: string | null;
  manufactureDate?: string | null;
  expiryDate?: string | null;
  lastInspectionDate?: string | null;
  nextInspectionDate?: string | null;
  lastMaintenanceDate?: string | null;
  nextMaintenanceDate?: string | null;
  notes?: string;
  imageUrl?: string;
  attachments?: string[];
  ppeDetails?: Record<string, unknown>;
  extinguisherDetails?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface UpdateInventoryItemDto extends Partial<CreateInventoryItemDto> {}

export interface CreateInventoryMovementDto {
  inventoryItem: string;
  company?: string;
  movementType: InventoryMovementType | string;
  quantity?: number;
  unit?: string;
  fromZone?: string | null;
  toZone?: string | null;
  employee?: string | null;
  reason?: string;
  reference?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateInventoryAssignmentDto {
  inventoryItem: string;
  company?: string;
  employee: string;
  assignmentType?: InventoryAssignmentType | string;
  zone?: string | null;
  expectedReturnDate?: string | null;
  notes?: string;
  metadata?: Record<string, unknown>;
}

export interface ReturnInventoryAssignmentDto {
  returnCondition?: string;
  notes?: string;
}

export interface CreateInventoryInspectionDto {
  inventoryItem: string;
  company?: string;
  inspectionDate?: string;
  result: InventoryInspectionResult | string;
  status?: string;
  condition?: string;
  findings?: string;
  actionsRequired?: string;
  nextInspectionDate?: string | null;
  zone?: string | null;
  notes?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateInventoryInspectionDto
  extends Partial<CreateInventoryInspectionDto> {}

@Injectable({
  providedIn: 'root',
})
export class InventoryServices {
  private http = inject(HttpClient);

  private buildParams<T extends object>(filters?: T): HttpParams {
    let params = new HttpParams();

    if (!filters) return params;

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });

    return params;
  }

  // =========================
  // ITEMS
  // =========================
  getInventoryItems(
    filters?: InventoryItemFilters
  ): Observable<InventoryItemsResponse> {
    return this.http.get<InventoryItemsResponse>(API_URLS.inventory.items.all, {
      params: this.buildParams(filters),
    });
  }

  getInventoryItemById(id: string): Observable<InventoryItemResponse> {
    return this.http.get<InventoryItemResponse>(API_URLS.inventory.items.byId(id));
  }

  createInventoryItem(
    data: CreateInventoryItemDto
  ): Observable<InventoryItemResponse> {
    return this.http.post<InventoryItemResponse>(
      API_URLS.inventory.items.create,
      data
    );
  }

  updateInventoryItem(
    id: string,
    data: UpdateInventoryItemDto
  ): Observable<InventoryItemResponse> {
    return this.http.put<InventoryItemResponse>(
      API_URLS.inventory.items.update(id),
      data
    );
  }

  deleteInventoryItem(
    id: string,
    hard = false
  ): Observable<{ message: string; item?: InventoryItem }> {
    return this.http.delete<{ message: string; item?: InventoryItem }>(
      API_URLS.inventory.items.delete(id),
      {
        params: this.buildParams({ hard }),
      }
    );
  }

  updateInventoryItemStatus(
    id: string,
    status: InventoryStatus | string
  ): Observable<InventoryItemResponse> {
    return this.http.patch<InventoryItemResponse>(
      API_URLS.inventory.items.updateStatus(id),
      { status }
    );
  }

  assignInventoryItem(
    id: string,
    employeeId: string
  ): Observable<InventoryItemResponse> {
    return this.http.patch<InventoryItemResponse>(
      API_URLS.inventory.items.assign(id),
      { employeeId }
    );
  }

  unassignInventoryItem(id: string): Observable<InventoryItemResponse> {
    return this.http.patch<InventoryItemResponse>(
      API_URLS.inventory.items.unassign(id),
      {}
    );
  }

  getInventoryStats(company?: string): Observable<InventoryStatsResponse> {
    return this.http.get<InventoryStatsResponse>(API_URLS.inventory.items.stats, {
      params: this.buildParams({ company }),
    });
  }

  getExpiredInventoryItems(company?: string): Observable<InventorySimpleListResponse> {
    return this.http.get<InventorySimpleListResponse>(API_URLS.inventory.items.expired, {
      params: this.buildParams({ company }),
    });
  }

  getLowStockInventoryItems(company?: string): Observable<InventorySimpleListResponse> {
    return this.http.get<InventorySimpleListResponse>(API_URLS.inventory.items.lowStock, {
      params: this.buildParams({ company }),
    });
  }

  // =========================
  // MOVEMENTS
  // =========================
  getInventoryMovements(
    filters?: InventoryMovementFilters
  ): Observable<InventoryMovementsResponse> {
    return this.http.get<InventoryMovementsResponse>(
      API_URLS.inventory.movements.all,
      {
        params: this.buildParams(filters),
      }
    );
  }

  getInventoryMovementById(id: string): Observable<InventoryMovementResponse> {
    return this.http.get<InventoryMovementResponse>(
      API_URLS.inventory.movements.byId(id)
    );
  }

  createInventoryMovement(
    data: CreateInventoryMovementDto
  ): Observable<InventoryMovementResponse> {
    return this.http.post<InventoryMovementResponse>(
      API_URLS.inventory.movements.create,
      data
    );
  }

  deleteInventoryMovement(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      API_URLS.inventory.movements.delete(id)
    );
  }

  // =========================
  // ASSIGNMENTS
  // =========================
  getInventoryAssignments(
    filters?: InventoryAssignmentFilters
  ): Observable<InventoryAssignmentsResponse> {
    return this.http.get<InventoryAssignmentsResponse>(
      API_URLS.inventory.assignments.all,
      {
        params: this.buildParams(filters),
      }
    );
  }

  getInventoryAssignmentById(id: string): Observable<InventoryAssignmentResponse> {
    return this.http.get<InventoryAssignmentResponse>(
      API_URLS.inventory.assignments.byId(id)
    );
  }

  createInventoryAssignment(
    data: CreateInventoryAssignmentDto
  ): Observable<InventoryAssignmentResponse> {
    return this.http.post<InventoryAssignmentResponse>(
      API_URLS.inventory.assignments.create,
      data
    );
  }

  returnInventoryAssignment(
    id: string,
    data: ReturnInventoryAssignmentDto
  ): Observable<InventoryAssignmentResponse> {
    return this.http.patch<InventoryAssignmentResponse>(
      API_URLS.inventory.assignments.return(id),
      data
    );
  }

  updateInventoryAssignmentStatus(
    id: string,
    status: InventoryAssignmentStatus | string
  ): Observable<InventoryAssignmentResponse> {
    return this.http.patch<InventoryAssignmentResponse>(
      API_URLS.inventory.assignments.updateStatus(id),
      { status }
    );
  }

  deleteInventoryAssignment(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      API_URLS.inventory.assignments.delete(id)
    );
  }

  // =========================
  // INSPECTIONS
  // =========================
  getInventoryInspections(
    filters?: InventoryInspectionFilters
  ): Observable<InventoryInspectionsResponse> {
    return this.http.get<InventoryInspectionsResponse>(
      API_URLS.inventory.inspections.all,
      {
        params: this.buildParams(filters),
      }
    );
  }

  getInventoryInspectionById(id: string): Observable<InventoryInspectionResponse> {
    return this.http.get<InventoryInspectionResponse>(
      API_URLS.inventory.inspections.byId(id)
    );
  }

  createInventoryInspection(
    data: CreateInventoryInspectionDto
  ): Observable<InventoryInspectionResponse> {
    return this.http.post<InventoryInspectionResponse>(
      API_URLS.inventory.inspections.create,
      data
    );
  }

  updateInventoryInspection(
    id: string,
    data: UpdateInventoryInspectionDto
  ): Observable<InventoryInspectionResponse> {
    return this.http.put<InventoryInspectionResponse>(
      API_URLS.inventory.inspections.update(id),
      data
    );
  }

  deleteInventoryInspection(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      API_URLS.inventory.inspections.delete(id)
    );
  }
}