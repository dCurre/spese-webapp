import { Component, OnInit } from '@angular/core';

import { AngularFireAuth } from '@angular/fire/compat/auth';
import { UserService } from '../../shared/services/firestore/user/user.service';
import { User } from '../../shared/services/firestore/user/user';
import { Observable } from 'rxjs';
import { UserFieldsEnum } from 'src/app/shared/enums/userFieldsEnum';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  protected userList$: Observable<User[]>;
  protected loggedUser$: Observable<User>;

  constructor(
    public afAuth: AngularFireAuth,
    private userService: UserService
    ) { }

  ngOnInit(): void {
    this.getLoggedUser()
  }

  logout(): void {
    this.afAuth.signOut();
  }

  async getUsers() {
    this.userList$ = this.userService.getAllUsers();
  }

  async getUserById(field: string, id: string) {
    this.loggedUser$ = this.userService.getUserByField(field, id);
  }

  async getLoggedUser() {
    this.afAuth.authState.subscribe(user => {
      try{
        this.loggedUser$ = this.userService.getUserByField(UserFieldsEnum.ID, user!!.uid);
      } catch (e){
          console.error("HomeComponent.getLoggedUser: ", e)
      }
    });
  }
}
