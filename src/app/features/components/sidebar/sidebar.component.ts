import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { map, Observable } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { SidenavService } from 'src/app/core/services/sidenav/sidenav.service';
import { environment } from 'src/environments/environment';
import { APP_NAME } from 'src/app/version';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  appName = APP_NAME;

  constructor(
    public sidenavService: SidenavService,
    protected authService: AuthService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
  }

  closeSidebar(){
    this.sidenavService.close();
  }
  
  logout(): void {
    this.authService.signOut();
  }

}
