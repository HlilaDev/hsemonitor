import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

import {
  InventoryCategory,
  InventoryCondition,
  InventoryItem,
  InventoryServices,
  InventoryStatus,
  UpdateInventoryItemDto,
} from '../../../../core/services/inventory/inventory-services';

@Component({
  selector: 'app-edit-inventory',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './edit-inventory.html',
  styleUrl: './edit-inventory.scss',
})
export class EditInventory {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private inventoryService = inject(InventoryServices);

  inventoryId = '';
  item = signal<InventoryItem | null>(null);

  loading = signal(false);
  saving = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  categories: InventoryCategory[] = [
    'ppe',
    'extinguisher',
    'medical',
    'tool',
    'signage',
    'other',
  ];

  statuses: InventoryStatus[] = [
    'available',
    'assigned',
    'in_stock',
    'low_stock',
    'maintenance',
    'expired',
    'damaged',
    'lost',
    'out_of_service',
  ];

  conditions: InventoryCondition[] = [
    'new',
    'good',
    'fair',
    'poor',
    'damaged',
  ];

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    category: ['ppe', Validators.required],
    subCategory: [''],
    inventoryCode: [''],
    brand: [''],
    model: [''],
    serialNumber: [''],
    status: ['available', Validators.required],
    condition: ['good', Validators.required],
    quantity: [1, [Validators.required, Validators.min(0)]],
    minStockLevel: [0, [Validators.min(0)]],
    unit: ['piece'],
    locationDescription: [''],
    supplier: [''],
    purchaseDate: [''],
    purchasePrice: [null],
    warrantyUntil: [''],
    manufactureDate: [''],
    expiryDate: [''],
    lastInspectionDate: [''],
    nextInspectionDate: [''],
    lastMaintenanceDate: [''],
    nextMaintenanceDate: [''],
    notes: [''],
    imageUrl: [''],
  });

  constructor() {
    this.inventoryId = this.route.snapshot.paramMap.get('id') || '';

    if (!this.inventoryId) {
      this.errorMessage.set("Identifiant d'inventaire introuvable.");
      return;
    }

    this.loadInventory();
  }

  get f() {
    return this.form.controls;
  }

  get categoryValue(): string {
    return this.form.get('category')?.value || '';
  }

  get isPpe(): boolean {
    return this.categoryValue === 'ppe';
  }

  get isExtinguisher(): boolean {
    return this.categoryValue === 'extinguisher';
  }

  loadInventory(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.inventoryService
      .getInventoryItemById(this.inventoryId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          const item = response.item;
          this.item.set(item);
          this.patchForm(item);
        },
        error: (error) => {
          const message =
            error?.error?.message ||
            "Impossible de charger l'élément d'inventaire.";
          this.errorMessage.set(message);
        },
      });
  }

  patchForm(item: InventoryItem): void {
    this.form.patchValue({
      name: item.name || '',
      description: item.description || '',
      category: item.category || 'ppe',
      subCategory: item.subCategory || '',
      inventoryCode: item.inventoryCode || '',
      brand: item.brand || '',
      model: item.model || '',
      serialNumber: item.serialNumber || '',
      status: item.status || 'available',
      condition: item.condition || 'good',
      quantity: item.quantity ?? 1,
      minStockLevel: item.minStockLevel ?? 0,
      unit: item.unit || 'piece',
      locationDescription: item.locationDescription || '',
      supplier: item.supplier || '',
      purchaseDate: this.formatDateForInput(item.purchaseDate),
      purchasePrice: item.purchasePrice ?? null,
      warrantyUntil: this.formatDateForInput(item.warrantyUntil),
      manufactureDate: this.formatDateForInput(item.manufactureDate),
      expiryDate: this.formatDateForInput(item.expiryDate),
      lastInspectionDate: this.formatDateForInput(item.lastInspectionDate),
      nextInspectionDate: this.formatDateForInput(item.nextInspectionDate),
      lastMaintenanceDate: this.formatDateForInput(item.lastMaintenanceDate),
      nextMaintenanceDate: this.formatDateForInput(item.nextMaintenanceDate),
      notes: item.notes || '',
      imageUrl: item.imageUrl || '',
    });
  }

  formatDateForInput(value?: string | null): string {
    if (!value) return '';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    return date.toISOString().split('T')[0];
  }

  submit(): void {
    if (!this.inventoryId) {
      this.errorMessage.set("Identifiant d'inventaire introuvable.");
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage.set('Veuillez corriger les champs obligatoires.');
      this.successMessage.set('');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const raw = this.form.getRawValue();

    const payload: UpdateInventoryItemDto = {
      name: raw.name?.trim(),
      description: raw.description?.trim() || '',
      category: raw.category,
      subCategory: raw.subCategory?.trim() || '',
      inventoryCode: raw.inventoryCode?.trim() || '',
      brand: raw.brand?.trim() || '',
      model: raw.model?.trim() || '',
      serialNumber: raw.serialNumber?.trim() || '',
      status: raw.status,
      condition: raw.condition,
      quantity: Number(raw.quantity ?? 0),
      minStockLevel: Number(raw.minStockLevel ?? 0),
      unit: raw.unit?.trim() || 'piece',
      locationDescription: raw.locationDescription?.trim() || '',
      supplier: raw.supplier?.trim() || '',
      purchaseDate: raw.purchaseDate || null,
      purchasePrice:
        raw.purchasePrice !== null &&
        raw.purchasePrice !== '' &&
        raw.purchasePrice !== undefined
          ? Number(raw.purchasePrice)
          : null,
      warrantyUntil: raw.warrantyUntil || null,
      manufactureDate: raw.manufactureDate || null,
      expiryDate: raw.expiryDate || null,
      lastInspectionDate: raw.lastInspectionDate || null,
      nextInspectionDate: raw.nextInspectionDate || null,
      lastMaintenanceDate: raw.lastMaintenanceDate || null,
      nextMaintenanceDate: raw.nextMaintenanceDate || null,
      notes: raw.notes?.trim() || '',
      imageUrl: raw.imageUrl?.trim() || '',
    };

    this.inventoryService
      .updateInventoryItem(this.inventoryId, payload)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (response) => {
          this.item.set(response.item);
          this.successMessage.set("L'élément d'inventaire a été mis à jour avec succès.");
          this.errorMessage.set('');
          this.patchForm(response.item);
        },
        error: (error) => {
          const message =
            error?.error?.message ||
            "Une erreur est survenue lors de la mise à jour.";
          this.errorMessage.set(message);
          this.successMessage.set('');
        },
      });
  }

  reload(): void {
    this.loadInventory();
  }

  goBack(): void {
    this.router.navigate(['/manager/inventories']);
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
}