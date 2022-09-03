import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-join',
  templateUrl: './join.component.html',
  styleUrls: ['./join.component.css']
})
export class JoinComponent implements OnInit {

  protected listID: String;
  protected listExists = false;

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.getParams();
  }

  private getParams() {
    this.route.queryParams
      .subscribe(params => {
        console.log(params['list']);
        this.listID = params['list']
      }
      );
  }

}
