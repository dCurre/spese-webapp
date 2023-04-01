import { Component, OnInit } from '@angular/core';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-access-denied',
  templateUrl: './access-denied.component.html',
  styleUrls: ['./access-denied.component.css']
})
export class AccessDeniedComponent implements OnInit{

  constructor(
    private appComponent: AppComponent,) { }

  ngOnInit(): void {
    this.appComponent.showSpinner = false; //TODO: trovare un modo più intelligente per nascondere lo spinner
  }

}
