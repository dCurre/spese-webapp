import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

import { AngularFireAuth } from '@angular/fire/compat/auth';
import GenericUtils from 'src/app/utils/generic-utils';

@Injectable({
    providedIn: 'root'
})
export class SignInGuard implements CanActivate {
    constructor(private router: Router, private afAuth: AngularFireAuth) { }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

        return new Promise((resolve) => {
            this.afAuth.onAuthStateChanged((user) => {
                if (!GenericUtils.isNullOrUndefined(user)) {
                    this.router.navigate(['/']);
                }
                resolve(true);
            });
        });
    }

}

