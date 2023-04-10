import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, map } from 'rxjs';
import { User } from './user';
import { TablesEnum } from 'src/app/enums/tablesEnum';
import { UserFieldsEnum } from 'src/app/enums/userFieldsEnum';

@Injectable({
  providedIn: 'root'
})

export class UserService {

  private collection = this.db.collection<User>(TablesEnum.USER);
  loggedUser$: Observable<User>;

  constructor(
    private db: AngularFirestore,
    ) { }

  public setLoggedUser(loggedUser$: Observable<User>){
    this.loggedUser$ = loggedUser$;
  }

  public getLoggedUser() : Observable<User>{
    return this.loggedUser$;
  }

  insert(user: User) {
    try {
      this.collection.doc(user.id).set(Object.assign({}, user))
      return user;
    } catch (e) {
      console.error("Impossibile inserire utente, ", e)
      return null;
    }
  }

  insertGoogleUser(googleUser: import("firebase/compat").default.User | null) {
    var newUser: User = new User();
    newUser.id = googleUser!.uid
    newUser.email = googleUser!.email!
    newUser.fullname = googleUser?.displayName!
    newUser.profileImage = googleUser?.photoURL!
    newUser.hidePaidLists = false
    this.insert(newUser)
  }

  getUserByField(field: string, value: string) {
    return this.db.collection<User>(
      TablesEnum.USER,
      ref => ref.where(field, '==', value)
    ).valueChanges().pipe(
      map(users => {
        const user = users[0];
        console.debug("UserService.getUserByField:", user);
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
        console.debug("UserService.getById:", user);
        return user;
      })
    );
  };

  update(user: User) {
    try {
      this.collection.doc(user.id).update(Object.assign({}, user))
      return user;
    } catch (e) {
      console.error("Impossibile aggiornare user, ", e)
      return null;
    }
  };

}