import { Injectable } from '@angular/core';

import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map } from 'rxjs';
import { ExpensesList } from './expenses-list';
import { TablesEnum } from 'src/app/shared/enums/tablesEnum';

@Injectable({
 providedIn: 'root'
})

export class ExpensesListService {

    private collection = this.db.collection<ExpensesList>(TablesEnum.EXPENSES_LIST);

    constructor(private db: AngularFirestore) { }

    getAllExpensesLists() {
        return this.collection.valueChanges().pipe(map(coll => {
                return coll.map(user => {
                    console.log(user)
                    return user;
                });
            }));
    }

    getExpensesListByField(field: string, value: string) {
        return this.db.collection<ExpensesList>(
            TablesEnum.EXPENSES_LIST,
            ref => ref.where(field, '==', value)
        ).valueChanges().pipe(
            map(users => {
              const user = users[0];
              console.log(user);
              return user;
            })
          );
    };
    
}