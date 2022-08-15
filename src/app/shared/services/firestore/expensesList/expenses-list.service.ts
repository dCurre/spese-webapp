import { Injectable } from '@angular/core';

import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map } from 'rxjs';
import { ExpensesList } from './expenses-list';
import { TablesEnum } from 'src/app/shared/enums/tablesEnum';
import { ExpensesListFieldsEnum } from 'src/app/shared/enums/expensesListFieldsEnum';

@Injectable({
 providedIn: 'root'
})

export class ExpensesListService {

    private collection = this.db.collection<ExpensesList>(TablesEnum.EXPENSES_LIST);

    constructor(private db: AngularFirestore) { }

    getAll() {
        return this.collection.valueChanges().pipe(map(coll => {
                return coll.map(expensesList => {
                    //console.log(expensesList)
                    return expensesList;
                });
            }));
    }

    getByUserId(value: string) {
        return this.db.collection<ExpensesList>(
            TablesEnum.EXPENSES_LIST,
            ref => (
                ref.where(ExpensesListFieldsEnum.PARTECIPANTS, 'array-contains', value)
                .orderBy(ExpensesListFieldsEnum.PAID, 'asc')
                .orderBy(ExpensesListFieldsEnum.TIMESTAMP_INS, 'desc')
                ) 
            ).valueChanges().pipe(map(coll => {
            return coll.map(expensesList => {
                //console.log(expensesList)
                return expensesList;
            });
        }));
    };

    getById(value: string) {
        return this.db.collection<ExpensesList>(
            TablesEnum.EXPENSES_LIST,
            ref => (
                ref.where(ExpensesListFieldsEnum.ID, '==', value)
                ) 
            ).valueChanges().pipe(map(expensesList => {
                //console.log(expensesList[0])
                return expensesList[0];
        }));
    };
}