import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

import {
  CreateInventoryItemDto,
  InventoryCategory,
  InventoryCondition,
  InventoryServices,
  InventoryStatus,
} from '../../../../core/services/inventory/inventory-services';

@Component({
  selector: 'app-add-inventory',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './add-inventory.html',
  styleUrl: './add-inventory.scss',
})
export class AddInventory {
  private fb = inject(FormBuilder);
  private inventoryService = inject(InventoryServices);
  private router = inject(Router);

  loading = signal(false);
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
    'expired',
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
    condition: ['new', Validators.required],
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

  get categoryValue(): string {
    return this.form.get('category')?.value || '';
  }

  get isPpe(): boolean {
    return this.categoryValue === 'ppe';
  }

  get isExtinguisher(): boolean {
    return this.categoryValue === 'extinguisher';
  }

  get f() {
    return this.form.controls;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage.set('Veuillez corriger les champs obligatoires.');
      this.successMessage.set('');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const raw = this.form.getRawValue();

    const payload: CreateInventoryItemDto = {
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
      .createInventoryItem(payload)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.successMessage.set("L'élément d'inventaire a été ajouté avec succès.");
          this.errorMessage.set('');
          this.form.reset({
            category: 'ppe',
            status: 'available',
            condition: 'new',
            quantity: 1,
            minStockLevel: 0,
            unit: 'piece',
          });

          setTimeout(() => {
            this.router.navigate(['/manager/inventories']);
          }, 800);
        },
        error: (error) => {
          const message =
            error?.error?.message ||
            "Une erreur est survenue lors de l'ajout de l'inventaire.";
          this.errorMessage.set(message);
          this.successMessage.set('');
        },
      });
  }

  resetForm(): void {
    this.form.reset({
      category: 'ppe',
      status: 'available',
      condition: 'new',
      quantity: 1,
      minStockLevel: 0,
      unit: 'piece',
    });

    this.errorMessage.set('');
    this.successMessage.set('');
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
      case 'expired':
        return 'Expiré';
      default:
        return condition;
    }
  }
}