import { Component, ViewChild } from '@angular/core';
import { SidenavService } from './services/sidenav/sidenav.service';
import { MatSidenav } from '@angular/material/sidenav';
import { AuthService } from './services/auth/auth.service';
import { User } from './services/firestore/user/user';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent{
  title = 'spese-webapp';
  public showSpinner : boolean;
  
  protected loggedUser$: Observable<User>;

  @ViewChild(MatSidenav)
  protected sidenav!: MatSidenav;

  constructor(
    private sidenavService: SidenavService,
    private authService: AuthService) {
  }

  ngOnInit(): void {
    this.showSpinner = true;
    this.loggedUser$ = this.authService.getLoggedUser();
  }

  ngAfterViewInit(): void {
    this.initSidebar()
  }

  initSidebar() {
    this.sidenav.close();
    this.sidenavService.setSidenav(this.sidenav);
  }
}