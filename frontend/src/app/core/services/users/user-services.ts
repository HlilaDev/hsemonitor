import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { API_URLS } from '../../config/api_urls';

export interface User {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'operator' | 'hseManager' | 'admin';
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserServices {

  private http = inject(HttpClient);

  // ✅ GET ALL USERS
  getAllUsers() {
    return this.http
      .get(API_URLS.users.allusers)
      .pipe(catchError(this.handleError));
  }

  // ✅ GET USER BY ID
  getUserById(id: string) {
    return this.http
      .get(`${API_URLS.users.getUserById}${encodeURIComponent(id)}`)
      .pipe(catchError(this.handleError)); 
  }

  // ✅ CREATE USER
  addUser(payload: any) {
    return this.http
      .post(API_URLS.users.allusers, payload)
      .pipe(catchError(this.handleError));
  }

  // ✅ UPDATE USER
  updateUser(id: string, payload: any) {
    return this.http
      .put(`${API_URLS.users.editUser}${encodeURIComponent(id)}`, payload)
      .pipe(catchError(this.handleError));
  }

  // ✅ DELETE USER
  deleteUser(id: string) {
    return this.http
      .delete(`${API_URLS.users.deleteUser}${encodeURIComponent(id)}`)
      .pipe(catchError(this.handleError));
  }

  getTeam() {
  return this.http
    .get(API_URLS.users.getTeam)
    .pipe(catchError(this.handleError));
}

  private handleError(error: HttpErrorResponse) {
    const message =
      error?.error?.message || error?.message || 'Request failed';
    return throwError(() => new Error(message));
  }
}