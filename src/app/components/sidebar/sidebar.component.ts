import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { UserService } from 'src/app/services/firestore/user/user.service';
import { SidenavService } from 'src/app/services/sidenav/sidenav.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  constructor(
    public sidenavService: SidenavService,
    protected authService: AuthService) { }

  ngOnInit(): void {
  }

  closeSidebar(){
    this.sidenavService.close();
  }
  
  logout(): void {
    this.authService.signOut();
  }

}
