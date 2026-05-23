import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { APP_NAME } from 'src/app/version';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {

  appName = APP_NAME;
  leaving = false;

  constructor(private router: Router) {}

  ngOnInit(): void {}

  goToSignin() {
    this.leaving = true;
    setTimeout(() => this.router.navigate(['/signin']), 280);
  }
}
