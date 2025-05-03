import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmDialogFields } from './confirm-dialog-fields';


@Component({
  selector: 'app-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css']
})
export class DialogComponent implements OnInit {

  @Input() dialogFields: ConfirmDialogFields;

  constructor(public modalService: NgbActiveModal) { }

  ngOnInit(): void {
  }
}
