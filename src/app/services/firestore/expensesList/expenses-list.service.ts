import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map } from 'rxjs';
import { ExpensesList } from './expenses-list';
import { TablesEnum } from 'src/app/enums/tablesEnum';
import { ExpensesListFieldsEnum } from 'src/app/enums/expensesListFieldsEnum';
import { ExpenseService } from '../expense/expense.service';
import DateUtils from 'src/app/utils/date-utils';
import { User } from '../user/user';

@Injectable({
    providedIn: 'root'
})

export class ExpensesListService {

    private collection = this.db.collection<ExpensesList>(TablesEnum.EXPENSES_LIST);

    constructor(
        private db: AngularFirestore,
        private expenseService: ExpenseService
        ) { }

    getByUserId(user: User) {
        var query = this.collection.ref.where(ExpensesListFieldsEnum.PARTECIPANTS, 'array-contains', user.id)
            .orderBy(ExpensesListFieldsEnum.PAID, 'asc')
            .orderBy(ExpensesListFieldsEnum.TIMESTAMP_INS, 'desc')

        if (user.hidePaidLists) {
            //WORKAROUND PERCHE' NON POSSO FILTRARE E ORDINARE PER LO STESSO CAMPO
            query = query.where(ExpensesListFieldsEnum.PAID, '<=', false)
        }

        return this.db.collection<ExpensesList>(TablesEnum.EXPENSES_LIST, ref => query)
            .valueChanges().pipe(map(coll => {
                return coll.map(expensesList => {
                    console.debug("ExpensesListService.getByUserId:", expensesList)
                    return expensesList;
                });
            }));
    };

    getById(id: string) {
        return this.db.collection<ExpensesList>(
            TablesEnum.EXPENSES_LIST,
            ref => (
                ref.where(ExpensesListFieldsEnum.ID, '==', id)
            )
        ).valueChanges().pipe(map(expensesList => {
            console.debug("ExpensesListService.getById:", expensesList[0])
            return expensesList[0];
        }));
    };

    leave(userID: string, expensesList: ExpensesList) {
        expensesList.partecipants.splice(expensesList.partecipants.indexOf(userID), 1);
        //Se l'utente che abbandona è l'owner, passa l'ownership al primo disponibile in lista
        if (expensesList.owner == userID) {
            expensesList.owner = expensesList.partecipants[0]
        }
        this.update(expensesList);
    };

    delete(id: string) {
        try {
            this.expenseService.getExpensesByListID(id).subscribe(expensesList => {
                expensesList.forEach(expense => this.expenseService.delete(expense.id))
            })
            this.collection.doc(id).delete();
            return true;
        } catch (e) {
            console.error("Impossibile cancellare lista,", e)
            return false;
        }
    };

    update(expensesList: ExpensesList) {
        try {
            this.collection.doc(expensesList.id).update(expensesList)
            return expensesList;
        } catch (e) {
            console.error("Impossibile aggiornare lista,", e)
            return null;
        }
    };

    insert(newListName: string, uid: string) {
        try {
            var newList = new ExpensesList();
            newList.id = this.collection.doc().ref.id
            newList.name = newListName.trim();
            newList.owner = uid
            newList.paid = false;
            newList.partecipants = [uid];
            newList.timestampIns = DateUtils.getNowTimestamp();

            this.collection.doc(newList.id).set(Object.assign({}, newList))
            return newList;
        } catch (e) {
            console.error("Impossibile creare lista,", e)
            return null;
        }
    }
}