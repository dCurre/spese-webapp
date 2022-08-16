import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import Constants from 'src/app/constants/constants';
import { ExpensesList } from 'src/app/services/firestore/expensesList/expenses-list';

@Component({
  selector: 'app-new-list-dialog',
  templateUrl: './new-list-dialog.component.html',
  styleUrls: ['./new-list-dialog.component.css']
})
export class NewListDialogComponent implements OnInit {

public expensesList: ExpensesList

  public maxInputText = Constants.maxInputText;

  constructor(public modalService: NgbActiveModal) { }

  ngOnInit(): void {
    this.expensesList = new ExpensesList()
  }

  isValidListName(listName: string) {
    if (listName !== undefined && listName.trim().length > 0 && listName.trim().length <= this.maxInputText)
      return true;

    return false;
  }

}
