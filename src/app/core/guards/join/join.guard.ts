import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';
import { ExpensesListService } from '../../services/postgres/expenses-list/expenses-list.service';

@Injectable({
    providedIn: 'root'
})
export class JoinGuard implements CanActivate {
    constructor(
        private router: Router,
        private pgExpensesListService: ExpensesListService,
        private authService: AuthService,
    ) { }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

        return new Promise(async (resolve) => {
            const listID = Number(state.url.split("list=")[1]);

            if (!listID) {
                console.error("Join Guard: url non valido");
                this.router.navigate(['/accessdenied']);
                return resolve(false);
            }

            const pgUser = await this.authService.getUser();
            if (!pgUser) {
                this.router.navigate(['']);
                return resolve(false);
            }

            this.pgExpensesListService.getById(listID).subscribe({
                next: (expensesList) => {
                    const isOwner = expensesList.user_id === pgUser.id;
                    const isParticipant = expensesList.participants?.some(p => p.user_id === pgUser.id) ?? false;
                    if (isOwner || isParticipant) {
                        return resolve(this.router.createUrlTree(['/list', expensesList.id]));
                    }
                    resolve(true);
                },
                error: () => {
                    console.error('Join Guard: list not found');
                    resolve(this.router.createUrlTree(['/accessdenied']));
                }
            });
        });
    }
}
