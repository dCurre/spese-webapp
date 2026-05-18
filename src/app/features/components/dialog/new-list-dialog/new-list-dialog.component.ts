import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ExpensesList } from 'src/app/core/services/postgres/expenses-list/expenses-list';
import Constants from 'src/app/shared/constants/constants';
import StringUtils from 'src/app/shared/utils/string-utils';

@Component({
  selector: 'app-new-list-dialog',
  templateUrl: './new-list-dialog.component.html',
  styleUrls: ['./new-list-dialog.component.css']
})
export class NewListDialogComponent implements OnInit {

public expensesList: Partial<ExpensesList>

  public maxInputText = Constants.maxInputText;

  constructor(public modalService: NgbActiveModal) { }

  ngOnInit(): void {
    this.expensesList = {}
  }

  isValidListName(listName: string) {
    return !StringUtils.isNullOrEmpty(listName) && listName.trim().length <= this.maxInputText;
  }

}
