import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { User } from 'src/app/services/firestore/user/user';
import { UserService } from 'src/app/services/firestore/user/user.service';
import { SidenavService } from 'src/app/services/sidenav/sidenav.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  protected loggedUser$: Observable<User>;
  
  constructor(
    private afAuth: AngularFireAuth,
    private userService: UserService,
    private router: Router,
    private sidenavService: SidenavService) { }

  ngOnInit(): void {
    if (!this.isRouteSignin()) {
      this.getLoggedUser();
    }
  }

  getLoggedUser() {
    this.afAuth.authState.subscribe(user => {
      try {
        this.loggedUser$ = this.userService.getById(user!!.uid);
      } catch (e) {
        console.error("ToolbarComponent.getLoggedUser:", e)
      }
    });
  }

  closeSidebar(){
    this.sidenavService.close();
  }

  isRouteSignin() {
    return this.router.url == "/signin";
  }

  logout(): void {
    this.afAuth.signOut();
  }
}
