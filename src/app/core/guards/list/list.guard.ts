import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

import { AngularFireAuth } from '@angular/fire/compat/auth';
import { filter, first } from 'rxjs/operators';
import StringUtils from 'src/app/shared/utils/string-utils';
import { ExpensesListService } from '../../services/postgres/expenses-list/expenses-list.service';
import { UserService } from '../../services/postgres/user/user.service';

@Injectable({
    providedIn: 'root'
})
export class ListGuard implements CanActivate {
    constructor(
        private router: Router,
        private pgExpensesListService: ExpensesListService,
        private pgUserService: UserService,
        private afAuth: AngularFireAuth
    ) { }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

        return new Promise(async (resolve) => {
            const listID = Number(state.url.split("list/")[1]);

            if (!listID) {
                console.error("List Guard: url non valido");
                this.router.navigate(['/accessdenied']);
                return resolve(false);
            }

            const firebaseUser = await this.afAuth.authState.pipe(
                filter((u): u is any => u !== undefined),
                first()
            ).toPromise();
            if (!firebaseUser?.email) {
                this.router.navigate(['']);
                return resolve(false);
            }

            const pgUser = await this.pgUserService.getByEmail(firebaseUser.email).toPromise();
            if (!pgUser) {
                this.router.navigate(['']);
                return resolve(false);
            }

            this.pgExpensesListService.getById(listID).subscribe({
                next: (expensesList) => {
                    const isOwner = expensesList.user_id === pgUser.id;
                    const isParticipant = expensesList.participants?.some(p => p.user_id === pgUser.id) ?? false;
                    if (!isOwner && !isParticipant) {
                        this.router.navigate(['']);
                        return resolve(false);
                    }
                    resolve(true);
                },
                error: () => {
                    console.error('List Guard: list not found');
                    this.router.navigate(['']);
                    resolve(false);
                }
            });
        });
    }
}
