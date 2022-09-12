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

    getUserByField(field: string, value: string) {
        return this.db.collection<User>(
            TablesEnum.USER,
            ref => ref.where(field, '==', value)
        ).valueChanges().pipe(
            map(users => {
              const user = users[0];
              console.debug("UserService.getUserByField:",user);
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
              console.debug("UserService.getById:",user);
              return user;
            })
          );
    };
    
}