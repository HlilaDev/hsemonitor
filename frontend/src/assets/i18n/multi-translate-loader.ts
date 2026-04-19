import { HttpClient } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import { forkJoin, map, Observable } from 'rxjs';

export class MultiTranslateHttpLoader implements TranslateLoader {
  constructor(
    private http: HttpClient,
    private files: string[] = ['common', 'sidebar', 'auth'],
    private basePath = './assets/i18n'
  ) {}

  getTranslation(lang: string): Observable<any> {
    const requests = this.files.map((f) =>
      this.http.get<any>(`${this.basePath}/${lang}/${f}.json`)
    );

    return forkJoin(requests).pipe(
      map((responses) => responses.reduce((acc, obj) => ({ ...acc, ...obj }), {}))
    );
  }
}