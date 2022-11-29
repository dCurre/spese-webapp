import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { User } from 'src/app/services/firestore/user/user';
import { UserService } from 'src/app/services/firestore/user/user.service';
import { PathService } from 'src/app/services/path/path.service';
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
    private sidenavService: SidenavService,
    private pathService: PathService) { }

  ngOnInit(): void {
    if (!this.pathService.isPath("/signin")) {
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
  
  logout(): void {
    this.afAuth.signOut();
  }

  onImageLoad(evt: { target: { naturalWidth: any; naturalHeight: any; }; }) {
    if (evt && evt.target) {
      const width = evt.target.naturalWidth;
      const height = evt.target.naturalHeight;
      const portrait = height > width ? true : false;
      console.log(width, height, 'portrait: ', portrait);
    }
  }
}
