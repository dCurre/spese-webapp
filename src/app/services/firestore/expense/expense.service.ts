import { Injectable } from '@angular/core';

import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map } from 'rxjs';
import { Expense } from './expense';
import { TablesEnum } from 'src/app/enums/tablesEnum';
import { ExpenseFieldsEnum } from 'src/app/enums/expenseFieldsEnum';
import DateUtils from 'src/app/utils/date-utils';

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

    getExpensesByListID(id: string) {
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

    delete(id: string) {
        try {
            this.collection.doc(id).delete();
            return true;
        } catch (e) {
            console.error("Impossibile cancellare lista, ", e)
            return false;
        }
    };

    update(expense: Expense) {
        try {
            this.collection.doc(expense.id).update(expense)
            return expense;
        } catch (e) {
            console.error("Impossibile cancellare lista, ", e)
            return null;
        }
    };

    insert(expense: Expense, listID: string) {
        try {
            console.log(expense.expenseDate);
            console.log(DateUtils.ddmmyyyyToDate(expense.expenseDate));
            console.log(DateUtils.dateToTimestamp(DateUtils.ddmmyyyyToDate(expense.expenseDate)));
            expense.id = this.collection.doc().ref.id
            expense.expenseDateTimestamp = DateUtils.dateToTimestamp(DateUtils.ddmmyyyyToDate(expense.expenseDate));
            expense.expenseListID = listID;
            this.collection.doc(expense.id).set(Object.assign({}, expense))
            return expense;
        } catch (e) {
            console.error("Impossibile cancellare lista, ", e)
            return null;
        }
    }

}