import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ExpensesListService } from '../../services/postgres/expenses-list/expenses-list.service';

/** Richiede un link di invito valido; chi è già nella lista ci va direttamente. */
@Injectable({
    providedIn: 'root'
})
export class JoinGuard implements CanActivate {
    constructor(
        private router: Router,
        private pgExpensesListService: ExpensesListService,
    ) { }

    canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> {
        const denied = this.router.createUrlTree(['/accessdenied']);
        const token = route.queryParams['token'];
        if (!token) return of(denied);

        return this.pgExpensesListService.previewInvite(token).pipe(
            map(invite => invite.is_member ? this.router.createUrlTree(['/list', invite.id]) : true),
            catchError(() => of(denied)),
        );
    }
}
