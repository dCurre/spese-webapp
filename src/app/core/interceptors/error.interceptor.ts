import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, tap, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ToastService } from '../services/toast/toast.service';

const MUTATION_METHODS = new Set(['POST', 'PUT', 'DELETE', 'PATCH']);

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(
    private toastService: ToastService,
    private afAuth: AngularFireAuth,
    private router: Router,
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const isMutation = MUTATION_METHODS.has(req.method);
    const isByEmail = req.url.includes('/by-email/');

    return next.handle(req).pipe(
      tap(event => {
        if (isMutation && event instanceof HttpResponse) {
          if (req.headers.has('X-Silent')) return;
          const message = event.body?.message;
          if (message) this.toastService.success(message);
        }
      }),
      catchError(err => {
        // Errore di rete su chiamate by-email → logout
        if (isByEmail && err.status === 0) {
          this.afAuth.signOut().then(() => this.router.navigate(['/signin']));
          return throwError(() => err);
        }
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
