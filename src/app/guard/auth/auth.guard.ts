import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

import { AngularFireAuth } from '@angular/fire/compat/auth';
import GenericUtils from 'src/app/utils/generic-utils';

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

        return new Promise((resolve) => {
            this.afAuth.onAuthStateChanged((user) => {
                if (GenericUtils.isNullOrUndefined(user)) {
                    console.debug('Auth Guard: user is not logged in');
                    this.router.navigate(['/signin']);
                    resolve(true);
                    return;
                }
                
                console.debug('Auth Guard: user is logged in');
                resolve(true);
            });
        });
    }

}

