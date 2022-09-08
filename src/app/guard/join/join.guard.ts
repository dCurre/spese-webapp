import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ExpensesListService } from 'src/app/services/firestore/expensesList/expenses-list.service';
import ListUtils from 'src/app/utils/list-utils';

@Injectable({
    providedIn: 'root'
})
export class JoinGuard implements CanActivate {
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
            const listID = state.url.split("list=")[1] //FA SCHIFO AL CAZZO

            //Check validità id lista
            if (listID == null || listID == undefined || listID.length == 0) {
                console.error("Url non valido")
                this.router.navigate(['/accessdenied']);
                resolve(false);
            }

            //Check esistenza lista
            this.expensesListService.getById(listID).subscribe(expensesList => {
                if (expensesList == undefined) {
                    console.error('Join Guard: list not found');
                    this.router.navigate(['/accessdenied']);
                    resolve(false);
                }

                //Se l'utente fa già parte della lista --> redirect alla lista stessa
                this.afAuth.onAuthStateChanged((user) => {
                    if (ListUtils.contains(expensesList.partecipants, user?.uid)) {
                        this.router.navigate(['/list/'+ expensesList.id]);
                        resolve(false);
                    }

                    resolve(true);
                });


            })
        });
    }
}

