import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { PathService } from 'src/app/services/path/path.service';
import { SidenavService } from 'src/app/services/sidenav/sidenav.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {


  constructor(
    public afAuth: AngularFireAuth,
    private router: Router,
    public pathService: PathService,
    protected sidenavService: SidenavService) { }

  ngOnInit(): void {
  }

  toogleSidebar() {
    this.sidenavService.toggle();
  }

  isSignin(): boolean {
    return !this.pathService.isPath('/signin')
  }
}
