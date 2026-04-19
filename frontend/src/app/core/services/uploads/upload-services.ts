import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URLS } from '../../config/api_urls';

@Injectable({ providedIn: 'root' })
export class UploadServices {
  constructor(private http: HttpClient) {}

  uploadImages(files: File[]): Observable<{ urls: string[] }> {
    const fd = new FormData();
    files.forEach(f => fd.append('images', f));
    return this.http.post<{ urls: string[] }>(API_URLS.upload.images, fd, {
      withCredentials: true,
    });
  }
}