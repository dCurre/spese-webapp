import { Component, ViewChild } from '@angular/core';
import { SidenavService } from './services/sidenav/sidenav.service';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent{
  title = 'spese-webapp';
  public showSpinner = true;

  @ViewChild(MatSidenav)
  protected sidenav!: MatSidenav;

  constructor(
    private sidenavService: SidenavService) {
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

}
