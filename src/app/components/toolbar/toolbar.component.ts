import { Component, OnInit } from '@angular/core';

import { AngularFireAuth } from '@angular/fire/compat/auth';
import { UserService } from '../../services/firestore/user/user.service';
import { User } from '../../services/firestore/user/user';
import { Observable } from 'rxjs';
import { UserFieldsEnum } from 'src/app/enums/userFieldsEnum';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {

  protected loggedUser$: Observable<User>;

  constructor(
    public afAuth: AngularFireAuth,
    private userService: UserService) { }

  ngOnInit(): void {
    this.getLoggedUser()
  }

  logout(): void {
    this.afAuth.signOut();
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
