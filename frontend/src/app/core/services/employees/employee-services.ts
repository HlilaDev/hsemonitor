import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { API_URLS } from '../../config/api_urls';

export type Employee = {
  _id?: string;
  fullName: string;
  employeeId?: string | null;
  department?: string | null;
  jobTitle?: string | null;
  zone?: string | { _id?: string; name?: string } | null;
  phone?: string | null;
  hireDate?: string | Date | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

@Injectable({ providedIn: 'root' })
export class EmployeeServices {
  private http = inject(HttpClient);

  getAllEmployees(params?: any) {
    let httpParams = new HttpParams();
    if (params?.q) httpParams = httpParams.set('q', params.q);
    if (params?.department) httpParams = httpParams.set('department', params.department);
    if (params?.zone) httpParams = httpParams.set('zone', params.zone);
    if (params?.isActive !== undefined) httpParams = httpParams.set('isActive', String(params.isActive));

    return this.http
      .get(API_URLS.employees.allEmployee, { params: httpParams })
      .pipe(catchError(this.handleError));
  }

  getEmployeeById(id: string) {
    return this.http
      .get(`${API_URLS.employees.getEmployeeById}${encodeURIComponent(id)}`)
      .pipe(catchError(this.handleError));
  }

  createEmployee(payload: any) {
    return this.http
      .post(API_URLS.employees.addEmployee, payload)
      .pipe(catchError(this.handleError));
  }

  updateEmployee(id: string, payload: any) {
    return this.http
      .put(`${API_URLS.employees.editEmployee}${encodeURIComponent(id)}`, payload)
      .pipe(catchError(this.handleError));
  }

  deleteEmployee(id: string) {
    return this.http
      .delete(`${API_URLS.employees.deleteEmployee}${encodeURIComponent(id)}`)
      .pipe(catchError(this.handleError));
  }

  //get employee by zone 
  getEmployeesByZone(zoneId: string) {
  return this.http
    .get<Employee[]>(`${API_URLS.employees.getEmployeesByZone}${encodeURIComponent(zoneId)}`)
    .pipe(catchError(this.handleError));
}

  // ✅ Fix for TS2339: method exists and matches backend PUT /:id
  toggleActive(id: string, isActive: boolean) {
    return this.updateEmployee(id, { isActive });
  }

  // Existing backend endpoint (one-way disable)
  disableEmployee(id: string) {
    return this.http
      .patch(`${API_URLS.employees.editEmployee}${encodeURIComponent(id)}/disable`, {})
      .pipe(catchError(this.handleError));
  }

  private handleError(err: HttpErrorResponse) {
    const msg = err?.error?.message || err?.message || 'Request failed';
    return throwError(() => new Error(msg));
  }
}
