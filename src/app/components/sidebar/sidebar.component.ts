import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth/auth.service';
import { User } from 'src/app/services/firestore/user/user';
import { SidenavService } from 'src/app/services/sidenav/sidenav.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  protected loggedUser$: Observable<User>;
  
  constructor(
    private sidenavService: SidenavService,
    private authService: AuthService) { }

  ngOnInit(): void {
    this.loggedUser$ = this.authService.getLoggedUser()
  }

  closeSidebar(){
    this.sidenavService.close();
  }
  
  logout(): void {
    this.authService.signOut();
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
