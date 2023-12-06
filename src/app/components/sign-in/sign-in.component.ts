import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service'
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnInit {

  loginForm: FormGroup;
  firebaseErrorMessage: string;

  constructor(public authService: AuthService) {
    this.loginForm = new FormGroup({
      'email': new FormControl('', [Validators.required, Validators.email]),
      'password': new FormControl('', Validators.required)
    });

    this.firebaseErrorMessage = '';

  }

  ngOnInit(): void {
  }

}
