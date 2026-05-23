import { Component, OnInit } from '@angular/core';
import { SidenavService } from 'src/app/core/services/sidenav/sidenav.service';
import { APP_NAME } from 'src/app/version';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {
  appName = APP_NAME;

  constructor(public sidenavService: SidenavService) { }

  ngOnInit(): void {}
}
