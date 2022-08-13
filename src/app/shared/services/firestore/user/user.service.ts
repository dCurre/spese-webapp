import { Injectable } from '@angular/core';

import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map, Observable } from 'rxjs';
import { User } from './user';

@Injectable({
 providedIn: 'root'
})

export class UserService {

    private collection = this.db.collection<User>('User');

    constructor(private db: AngularFirestore) { }

    getAllUsers() {
        return this.collection.valueChanges().pipe(map(coll => {
                return coll.map(user => {
                    console.log(user)
                    return user;
                });
            }));
    }

    getUserById(id: string) {
        return this.collection.doc(id).valueChanges().pipe(user => {
                console.log(user)
                return user;
            });
    };
    
}