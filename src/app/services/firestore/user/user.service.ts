import { Injectable } from '@angular/core';

import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map } from 'rxjs';
import { User } from './user';
import { TablesEnum } from 'src/app/enums/tablesEnum';
import { UserFieldsEnum } from 'src/app/enums/userFieldsEnum';

@Injectable({
 providedIn: 'root'
})

export class UserService {

    private collection = this.db.collection<User>(TablesEnum.USER);

    constructor(private db: AngularFirestore) { }

    getAllUsers() {
        return this.collection.valueChanges().pipe(map(coll => {
                return coll.map(user => {
                    console.log(user)
                    return user;
                });
            }));
    }

    getUserByField(field: string, value: string) {
        return this.db.collection<User>(
            TablesEnum.USER,
            ref => ref.where(field, '==', value)
        ).valueChanges().pipe(
            map(users => {
              const user = users[0];
              console.log(user);
              return user;
            })
          );
    };

    getById(value: string) {
        return this.db.collection<User>(
            TablesEnum.USER,
            ref => ref.where(UserFieldsEnum.ID, '==', value)
        ).valueChanges().pipe(
            map(users => {
              const user = users[0];
              console.log(user);
              return user;
            })
          );
    };
    
}