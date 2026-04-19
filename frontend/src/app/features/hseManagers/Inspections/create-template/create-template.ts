import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { ChecklistServices } from '../../../../core/services/checklist/checklist-services';

type ItemType = 'boolean' | 'text' | 'number';

interface TemplateItem {
  label: string;
  type: ItemType;
  isRequired: boolean;
}

@Component({
  selector: 'app-create-template',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './create-template.html',
  styleUrl: './create-template.scss',
})
export class CreateTemplate {
  private checklistService = inject(ChecklistServices);
  private router = inject(Router);

  loading = false;
  errorMsg = '';
  successMsg = '';

  form = {
    title: '',
    description: '',
    category: 'safety',
  };

  items: TemplateItem[] = [
    {
      label: '',
      type: 'boolean',
      isRequired: true,
    },
  ];

  addItem(): void {
    this.items.push({
      label: '',
      type: 'boolean',
      isRequired: true,
    });
  }

  removeItem(index: number): void {
    if (this.items.length === 1) return;
    this.items.splice(index, 1);
  }

  submit(): void {
    this.errorMsg = '';
    this.successMsg = '';

    if (!this.form.title.trim()) {
      this.errorMsg = 'Le titre est obligatoire.';
      return;
    }

    const validItems = this.items.filter((i) => i.label.trim());

    if (!validItems.length) {
      this.errorMsg = 'Ajoutez au moins un item valide.';
      return;
    }

    this.loading = true;

    this.checklistService
      .createTemplate({
        title: this.form.title,
        description: this.form.description,
        category: this.form.category as any,
        items: validItems.map((item, index) => ({
          ...item,
          order: index,
        })),
      })
      .subscribe({
        next: () => {
          this.successMsg = 'Template créé avec succès.';
          this.loading = false;

          setTimeout(() => {
            this.router.navigate(['/manager/inspections/templates']);
          }, 1000);
        },
        error: (err) => {
          console.error(err);
          this.errorMsg =
            err?.error?.message || 'Erreur lors de la création.';
          this.loading = false;
        },
      });
  }
}