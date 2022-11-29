import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {
    constructor(private router: Router, private afAuth: AngularFireAuth) { }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

        return new Promise((resolve) => {
            this.afAuth.onAuthStateChanged((user) => {
                if (user == null || user == undefined) {
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

