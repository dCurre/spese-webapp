import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { PathService } from './core/services/path/path.service';
import { AuthService } from './core/services/auth/auth.service';
import { ThemeService } from './core/services/theme/theme.service';

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
    private router: Router,
    private authService: AuthService,
    private themeService: ThemeService) {

    this.router.events.forEach((event) => {
      if (event instanceof NavigationEnd) {
        this.showSpinner = false;
      }
    });

    this.authService.getStoredUser().subscribe(user => {
      this.themeService.apply(user);
    });
  }

  isPathSignin(): boolean {
    return !this.pathService.isPath('/signin') && !this.pathService.isPath('/signup');
  }
}
