import { Injectable } from '@angular/core';
import { CanActivate, Router, RouterStateSnapshot, ActivatedRouteSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { filter, first } from 'rxjs/operators';
import { UserService } from '../../services/postgres/user/user.service';

@Injectable({
    providedIn: 'root'
})
export class AdminGuard implements CanActivate {
    constructor(
        private router: Router,
        private pgUserService: UserService,
        private afAuth: AngularFireAuth
    ) { }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

        return new Promise(async (resolve) => {
            const firebaseUser = await this.afAuth.authState.pipe(
                filter((u): u is any => u !== undefined),
                first()
            ).toPromise();
            if (!firebaseUser?.email) {
                this.router.navigate(['']);
                return resolve(false);
            }

            const pgUser = await this.pgUserService.getByEmail(firebaseUser.email).toPromise();
            if (pgUser?.role !== 'admin' && pgUser?.role !== 'superadmin') {
                this.router.navigate(['/accessdenied']);
                return resolve(false);
            }

            resolve(true);
        });
    }
}
