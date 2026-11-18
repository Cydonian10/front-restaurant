import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SKIP_AUTH } from './auth-context';
import { AuthService } from '../../auth/access-control/auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const apiUrl = new URL(`${environment.api.replace(/\/$/, '')}/`, window.location.origin);
  const requestUrl = new URL(request.url, window.location.origin);
  const isApi =
    requestUrl.origin === apiUrl.origin && requestUrl.pathname.startsWith(apiUrl.pathname);
  if (!isApi || request.context.get(SKIP_AUTH)) return next(request);

  const auth = inject(AuthService);
  const token = auth.token();
  const authorized =
    token && !request.headers.has('Authorization')
      ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : request;
  return next(authorized).pipe(
    catchError((error: unknown) => {
      if (
        token &&
        auth.token() === token &&
        typeof error === 'object' &&
        error !== null &&
        'status' in error &&
        error.status === 401
      ) {
        auth.logout();
      }
      return throwError(() => error);
    }),
  );
};
