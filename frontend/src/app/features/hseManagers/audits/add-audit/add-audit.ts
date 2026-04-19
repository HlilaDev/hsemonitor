import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

import {
  AuditServices,
  AuditStatus,
  AuditType,
  CreateAuditDto,
  FindingSeverity,
  FindingStatus,
} from '../../../../core/services/audits/audit-services';

@Component({
  selector: 'app-add-audit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './add-audit.html',
  styleUrl: './add-audit.scss',
})
export class AddAudit {
  private fb = inject(FormBuilder);
  private auditServices = inject(AuditServices);
  private router = inject(Router);

  loading = signal(false);
  error = signal('');
  success = signal('');

  auditTypes: AuditType[] = [
    'internal',
    'external',
    'safety',
    'environment',
    'compliance',
  ];

  auditStatuses: AuditStatus[] = [
    'planned',
    'in_progress',
    'completed',
    'cancelled',
  ];

  findingSeverities: FindingSeverity[] = ['low', 'medium', 'high', 'critical'];
  findingStatuses: FindingStatus[] = [
    'open',
    'in_progress',
    'resolved',
    'closed',
  ];

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    type: ['internal' as AuditType, [Validators.required]],
    status: ['planned' as AuditStatus, [Validators.required]],
    zone: [''],
    auditor: ['', [Validators.required]],
    scheduledDate: [''],
    completedDate: [''],
    score: [null as number | null, [Validators.min(0), Validators.max(100)]],
    attachmentsText: [''],
    findings: this.fb.array([]),
  });

  get findings(): FormArray {
    return this.form.get('findings') as FormArray;
  }

  createFindingGroup(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      severity: ['medium' as FindingSeverity, [Validators.required]],
      status: ['open' as FindingStatus, [Validators.required]],
      dueDate: [''],
      assignedTo: [''],
    });
  }

  addFinding(): void {
    this.findings.push(this.createFindingGroup());
  }

  removeFinding(index: number): void {
    this.findings.removeAt(index);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Please fill all required fields correctly.');
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.success.set('');

    const value = this.form.getRawValue();

    const attachments =
      value.attachmentsText
        ?.split(',')
        .map((item) => item.trim())
        .filter(Boolean) || [];

    const findings = (value.findings || []).map((finding: any) => ({
      title: finding.title?.trim() || '',
      description: finding.description?.trim() || '',
      severity: finding.severity || 'medium',
      status: finding.status || 'open',
      dueDate: finding.dueDate || undefined,
      assignedTo: finding.assignedTo?.trim() || undefined,
    }));

    const payload: CreateAuditDto = {
      title: value.title?.trim() || '',
      description: value.description?.trim() || '',
      type: value.type || 'internal',
      status: value.status || 'planned',
      zone: value.zone?.trim() || undefined,
      auditor: value.auditor?.trim() || '',
      scheduledDate: value.scheduledDate || undefined,
      completedDate: value.completedDate || undefined,
      score: value.score ?? undefined,
      findings,
      attachments,
    };

    this.auditServices
      .addAudit(payload)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (audit) => {
          this.success.set('Audit created successfully.');

          this.form.reset({
            title: '',
            description: '',
            type: 'internal',
            status: 'planned',
            zone: '',
            auditor: '',
            scheduledDate: '',
            completedDate: '',
            score: null,
            attachmentsText: '',
          });

          while (this.findings.length) {
            this.findings.removeAt(0);
          }

          setTimeout(() => {
            if (audit?._id) {
              this.router.navigate(['/manager/audits', audit._id]);
            } else {
              this.router.navigate(['/manager/audits']);
            }
          }, 700);
        },
        error: (err) => {
          this.error.set(
            err?.error?.message || 'Failed to create audit. Please try again.'
          );
        },
      });
  }

  fieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  findingFieldInvalid(index: number, field: string): boolean {
    const group = this.findings.at(index);
    const control = group?.get(field);
    return !!control && control.invalid && (control.touched || control.dirty);
  }
}