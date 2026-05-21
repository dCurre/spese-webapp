import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, first, map } from 'rxjs/operators';

import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {
    constructor(
        private router: Router,
        private afAuth: AngularFireAuth,) { }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

        // authState emits `undefined` while Firebase is initializing, then `null` (not logged in) or a User object.
        // We filter out `undefined` so we wait for the real auth state before deciding.
        return this.afAuth.authState.pipe(
            filter(user => user !== undefined),
            first(),
            map(user => {
                if (user) return true;
                sessionStorage.setItem('returnUrl', state.url);
                return this.router.createUrlTree(['/signin']);
            })
        );
    }
}

