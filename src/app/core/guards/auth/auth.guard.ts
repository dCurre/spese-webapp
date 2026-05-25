import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {
    constructor(
        private router: Router,
        private authService: AuthService,
    ) {}

    async canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot,
    ): Promise<boolean | UrlTree> {
        // Aspetta che AuthService abbia completato il flusso (inclusa eventuale creazione utente)
        const pgUser = await this.authService.getUser();
        if (pgUser) return true;
        sessionStorage.setItem('returnUrl', state.url);
        return this.router.createUrlTree(['/signin']);
    }
}

