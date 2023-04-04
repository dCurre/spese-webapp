import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ExpensesListService } from 'src/app/services/firestore/expensesList/expenses-list.service';
import ListUtils from 'src/app/utils/list-utils';
import StringUtils from 'src/app/utils/string-utils';
import GenericUtils from 'src/app/utils/generic-utils';

@Injectable({
    providedIn: 'root'
})
export class ListDetailsGuard implements CanActivate {
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
            const listID = state.url.split("details/")[1] //FA SCHIFO AL CAZZO

            //Check validità id lista
            if (StringUtils.isNullOrEmpty(listID)) {
                console.error("Url non valido")
                this.router.navigate(['/accessdenied']);
                resolve(false);
            }

            //Check esistenza lista
            this.expensesListService.getById(listID).subscribe(expensesList => {
                if (GenericUtils.isNullOrUndefined(expensesList)) {
                    console.error('ListDetails Guard: list not found');
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

