import { Component, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from './core/services/auth/auth.service';
import { PathService } from './core/services/path/path.service';
import { SidenavService } from './core/services/sidenav/sidenav.service';

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
    public pathService: PathService,
    private router: Router) {

      this.authService.getLoggedUser(); //Non rimuovere, serve per inizializzare il service coi dati del logged user
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