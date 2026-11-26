import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, from, of } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

/** Aggiunge l'ID token Firebase alle sole chiamate verso il backend. */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private afAuth: AngularFireAuth) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!req.url.startsWith(`${environment.pgApiUrl}/api/`)) return next.handle(req);

    // authState emette quando Firebase ha ripristinato la sessione; getIdToken rinnova se scaduto.
    return this.afAuth.authState.pipe(
      take(1),
      switchMap(user => user ? from(user.getIdToken()) : of(null)),
      switchMap(token => next.handle(
        token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req
      )),
    );
  }
}
