import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

import { AngularFireAuth } from '@angular/fire/compat/auth';
import GenericUtils from 'src/app/shared/utils/generic-utils';
import ListUtils from 'src/app/shared/utils/list-utils';
import StringUtils from 'src/app/shared/utils/string-utils';
import { ExpensesListService } from '../../services/firestore/expensesList/expenses-list.service';

@Injectable({
    providedIn: 'root'
})
export class ListGuard implements CanActivate {
    constructor(
        private router: Router,
        private expensesListService: ExpensesListService,
        private afAuth: AngularFireAuth
    ) { }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

        return new Promise((resolve) => {
            //Estraggo id lista
            const listID = state.url.split("list/")[1] //FA SCHIFO AL CAZZO

            //Check validità id lista
            if (StringUtils.isNullOrEmpty(listID)) {
                console.error("List Guard: url non valido")
                this.router.navigate(['/accessdenied']);
                resolve(false);
            }

            //Check esistenza lista
            this.expensesListService.getById(listID).subscribe(expensesList => {
                console.debug("--> expensesListService.getById() called by list guard")
                if (GenericUtils.isNullOrUndefined(expensesList)) {
                    console.error('List Guard: list not found');
                    this.router.navigate(['']);
                    resolve(false);
                }

                //Se l'utente non fa parte della lista
                this.afAuth.onAuthStateChanged((user) => {
                    if (!ListUtils.contains(expensesList.partecipants, user?.uid)) {
                        this.router.navigate(['']);
                        resolve(false);
                    }

                    resolve(true);
                });
            })
        });
    }
}

