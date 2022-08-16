import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Expense } from 'src/app/services/firestore/expense/expense';
import DateUtils from 'src/app/utils/date-utils';

@Component({
  selector: 'app-new-expense-dialog',
  templateUrl: './new-expense-dialog.component.html',
  styleUrls: ['./new-expense-dialog.component.css']
})
export class NewExpenseDialogComponent implements OnInit {

  protected expense: Expense;
  model: NgbDateStruct;
  today = this.calendar.getToday();

  constructor(public modalService: NgbActiveModal,
    private calendar: NgbCalendar) { }

  ngOnInit(): void {
    this.model = this.calendar.getToday();
    this.expense = new Expense();
    this.expense.expenseDate = DateUtils.dateToString(new Date());
  }

  selectToday() {
    this.model = this.calendar.getToday();
    this.expense.expenseDate = DateUtils.dateToString(new Date());
  }

  isValid(expense: Expense) {
    return expense.expense == null
     || expense.amount == null
     || expense.expenseDate == null
     || expense.buyer == null;
  }

  close(){
    this.expense.expenseDate = DateUtils.ngbDateStructToDateString(this.model);
    this.modalService.close(this.expense);
  }
}
