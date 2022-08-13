import { Injectable } from '@angular/core';

import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map } from 'rxjs';
import { Expense } from './expense';
import { TablesEnum } from 'src/app/shared/enums/tablesEnum';

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

    getExpenseByField(field: string, value: string) {
        return this.db.collection<Expense>(
            TablesEnum.EXPENSE,
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