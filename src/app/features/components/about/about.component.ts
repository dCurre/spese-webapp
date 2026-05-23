import { Component } from '@angular/core';
import { APP_VERSION, APP_NAME } from 'src/app/version';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent {
  version = APP_VERSION;
  appName = APP_NAME;
}
