import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DialogFields } from './DialogFields';


@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css']
})
export class DialogComponent implements OnInit {

  @Input() dialogFields: DialogFields;

  constructor(public modalService: NgbActiveModal) { }

  ngOnInit(): void {
  }
}
