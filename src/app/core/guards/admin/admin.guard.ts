import { Injectable } from '@angular/core';
import { CanActivate, Router, RouterStateSnapshot, ActivatedRouteSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class AdminGuard implements CanActivate {
    constructor(
        private router: Router,
        private authService: AuthService,
    ) { }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

        return new Promise(async (resolve) => {
            const pgUser = await this.authService.getUser();
            if (pgUser?.role !== 'admin' && pgUser?.role !== 'superadmin') {
                this.router.navigate(['/accessdenied']);
                return resolve(false);
            }

            resolve(true);
        });
    }
}
