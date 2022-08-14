import { Injectable } from '@angular/core';

import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map } from 'rxjs';
import { Expense } from './expense';
import { TablesEnum } from 'src/app/shared/enums/tablesEnum';
import { ExpenseFieldsEnum } from 'src/app/shared/enums/expenseFieldsEnum';

@Injectable({
    providedIn: 'root'
})

export class ExpenseService {

    private collection = this.db.collection<Expense>(TablesEnum.EXPENSE);

    constructor(private db: AngularFirestore) { }

    getAllExpenses() {
        return this.collection.valueChanges().pipe(map(coll => {
            return coll.map(user => {
                console.log(user)
                return user;
            });
        }));
    }

    getExpenseByListID(id: string) {
        return this.db.collection<Expense>(
            TablesEnum.EXPENSE,
            ref => ref.where(ExpenseFieldsEnum.EXPENSE_LIST_ID, '==', id)
                .orderBy(ExpenseFieldsEnum.EXPENSE_DATE_TIMESTAMP, 'asc')
        ).valueChanges().pipe(map(coll => {
            return coll.map(expensesList => {
                console.log(expensesList)
                return expensesList;
            });
        }));
    }

}