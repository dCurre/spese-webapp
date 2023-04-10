import { Component, ViewChild } from '@angular/core';
import { SidenavService } from './services/sidenav/sidenav.service';
import { MatSidenav } from '@angular/material/sidenav';
import { AuthService } from './services/auth/auth.service';
import { NavigationEnd, Router } from '@angular/router';
import { UserService } from './services/firestore/user/user.service';
import { PathService } from './services/path/path.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent{
  title = 'spese-webapp';
  protected showSpinner : boolean = true;

  @ViewChild(MatSidenav)
  protected sidenav!: MatSidenav;

  constructor(
    private sidenavService: SidenavService,
    private authService: AuthService,
    private userService: UserService,
    public pathService: PathService,
    private router: Router) {

      this.userService.setLoggedUser(this.authService.getLoggedUser());
      this.router.events.forEach((event) => {
        //Se passo al component successivo spengo lo spinner
        if(event instanceof NavigationEnd) {
          this.showSpinner = false;
        }
      });
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.initSidebar()
  }

  initSidebar() {
    this.sidenav.close();
    this.sidenavService.setSidenav(this.sidenav);
  }

  isPathSignin(): boolean {
    //Nascondo la toolbar in caso di redirect alla signin
    return !this.pathService.isPath('/signin')
  }
}