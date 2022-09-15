import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { SidenavService } from 'src/app/services/sidenav/sidenav.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {

  constructor(
    public afAuth: AngularFireAuth,
    private router: Router,
    protected sidenavService: SidenavService) { }

  ngOnInit(): void {
  }

  toogleSidebar() {
    this.sidenavService.toggle();
  }

  isSignin() {
    return this.router.url == "/signin";
  }
}
