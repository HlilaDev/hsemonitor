import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';

import { routes } from './app.routes';
import { credentialsInterceptor } from './interceptors/credentials.interceptor';

import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { MultiTranslateHttpLoader } from '../assets/i18n/multi-translate-loader';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(withInterceptors([credentialsInterceptor])),
    provideRouter(routes),

    provideTranslateService({
      loader: {
        provide: TranslateLoader,
        useFactory: (http: HttpClient) =>
          new MultiTranslateHttpLoader(http, ['common', 'sidebar', 'auth' , 'zones','devices','employees']),
        deps: [HttpClient],
      },
      fallbackLang: 'en',
    }),
  ],
};