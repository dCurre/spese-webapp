import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, tap, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastService } from '../services/toast/toast.service';

const MUTATION_METHODS = new Set(['POST', 'PUT', 'DELETE', 'PATCH']);

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private toastService: ToastService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const isMutation = MUTATION_METHODS.has(req.method);

    return next.handle(req).pipe(
      tap(event => {
        if (isMutation && event instanceof HttpResponse) {
          if (req.headers.has('X-Silent')) return;
          const message = event.body?.message;
          if (message) this.toastService.success(message);
        }
      }),
      catchError(err => {
        const body = err?.error;
        const code = body?.code ?? err.status;
        const text = body?.error ?? body?.message ?? err.message ?? 'Errore sconosciuto';
        const message = code ? `[${code}] ${text}` : text;
        this.toastService.error(message);
        return throwError(() => err);
      })
    );
  }
}
