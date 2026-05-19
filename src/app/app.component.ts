import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { PathService } from './core/services/path/path.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'spese-webapp';
  protected showSpinner: boolean = true;

  constructor(
    public pathService: PathService,
    private router: Router) {

    this.router.events.forEach((event) => {
      if (event instanceof NavigationEnd) {
        this.showSpinner = false;
      }
    });
  }

  isPathSignin(): boolean {
    return !this.pathService.isPath('/signin') && !this.pathService.isPath('/signup');
  }
}
