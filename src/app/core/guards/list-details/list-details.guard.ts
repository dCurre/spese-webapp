import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';
import { ExpensesListService } from '../../services/postgres/expenses-list/expenses-list.service';

@Injectable({
    providedIn: 'root'
})
export class ListDetailsGuard implements CanActivate {
    constructor(
        private router: Router,
        private pgExpensesListService: ExpensesListService,
        private authService: AuthService,
    ) { }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

        return new Promise(async (resolve) => {
            const listID = Number(state.url.split("details/")[1]);

            if (!listID) {
                console.error("ListDetails Guard: url non valido");
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
                    const isParticipant = expensesList.participants?.some(p => p.user_id === pgUser.id);
                    if (!isParticipant) {
                        this.router.navigate(['']);
                        return resolve(false);
                    }
                    resolve(true);
                },
                error: () => {
                    console.error('ListDetails Guard: list not found');
                    this.router.navigate(['']);
                    resolve(false);
                }
            });
        });
    }
}
