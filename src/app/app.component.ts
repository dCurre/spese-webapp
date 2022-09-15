import { Component, ViewChild } from '@angular/core';
import { SidenavService } from './services/sidenav/sidenav.service';
import { MatSidenav } from '@angular/material/sidenav';
import { Observable } from 'rxjs';
import { User } from './services/firestore/user/user';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'spese-webapp';

  @ViewChild(MatSidenav)
  protected sidenav!: MatSidenav;
  protected loggedUser$: Observable<User>;

  constructor(
    private sidenavService: SidenavService) {
  }

  ngAfterViewInit(): void {
    this.initSidebar()
  }

  initSidebar() {
    this.sidenav.close();
    this.sidenavService.setSidenav(this.sidenav);
  }
}
