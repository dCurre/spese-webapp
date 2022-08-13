import { Component, OnInit } from '@angular/core';

import { AngularFireAuth } from '@angular/fire/compat/auth';

import { UserService } from '../../shared/services/firestore/user/user.service';
import { User } from '../../shared/services/firestore/user/user';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  users$: Observable<User[]>;
  user$: Observable<User>;

  constructor(
    public afAuth: AngularFireAuth,
    private userService: UserService
    ) { }

  ngOnInit(): void {
    this.getUsers();
  }

  logout(): void {
    this.afAuth.signOut();
}

  async getUsers() {
    this.users$ = this.userService.getAllUsers();
  }

  async getUserById(id: string) {
  }
}
