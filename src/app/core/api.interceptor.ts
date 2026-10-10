import { HttpInterceptorFn } from '@angular/common/http';
export const apiInterceptor: HttpInterceptorFn = (request, next) => { const token = localStorage.getItem('docq-access-token'); return next(token ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` }, withCredentials: true }) : request.clone({ withCredentials: true })); };
