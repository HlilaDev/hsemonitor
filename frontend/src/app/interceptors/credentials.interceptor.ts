import { HttpInterceptorFn } from '@angular/common/http';

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  const reqClone = req.clone({
    withCredentials: true
  });

  return next(reqClone);
};