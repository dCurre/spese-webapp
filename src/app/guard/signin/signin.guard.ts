import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

import { AngularFireAuth } from '@angular/fire/compat/auth';

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
                console.log("Entro");
                if (user !== null && user !== undefined) {
                    this.router.navigate(['/']);
                }
                resolve(true);
            });
        });
    }

}

