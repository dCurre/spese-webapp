import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { SidenavService } from 'src/app/core/services/sidenav/sidenav.service';

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
