import { Component, OnInit } from '@angular/core';

import { AuthService } from 'src/app/services/auth/auth.service'
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { UserService } from 'src/app/services/firestore/user/user.service';
import { Observable } from 'rxjs';
import { User } from 'src/app/services/firestore/user/user';
import { PathService } from 'src/app/services/path/path.service';


@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnInit {

  loginForm: FormGroup;
  firebaseErrorMessage: string;
  protected loggedUser$: Observable<User>;

  constructor(public authService: AuthService,
    private afAuth: AngularFireAuth,
    private pathService: PathService,
    private userService: UserService,) {
    this.loginForm = new FormGroup({
        'email': new FormControl('', [Validators.required, Validators.email]),
        'password': new FormControl('', Validators.required)
    });

    this.firebaseErrorMessage = '';

  }

  ngOnInit(): void {
    if (!this.pathService.isPath("/signin")) {
      this.getLoggedUser()
  }
  }

  getLoggedUser() {
    this.afAuth.authState.subscribe(user => {
      try {
        this.loggedUser$ = this.userService.getById(user!!.uid);
      } catch (e) {
        console.error("SigninComponent.getLoggedUser:", e)
      }
    });
  }

}
