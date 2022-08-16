import { Component, OnInit } from '@angular/core';
import { stringLength } from '@firebase/util';
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
    this.expense = new Expense();
    this.model = this.calendar.getToday();
    this.expense.expenseDate = DateUtils.ngbDateStructToDateString(this.model);
  }

  selectToday() {
    this.model = this.calendar.getToday();
    this.expense.expenseDate = DateUtils.ngbDateStructToDateString(this.model);
  }

  isValid(expense: Expense) {
    return this.isValidExpense(expense.expense)
      && this.isValidAmount(expense.amount)
      && this.isValidDate(expense.expenseDate)
      && this.isValidBuyer(expense.buyer);
  }

  isValidAmount(amount: number) {
    if (amount !== undefined && amount > 0)
      return true;

    return false;
  }

  isValidExpense(expense: string) {
    if(expense !== undefined && expense.trim().length <= 14 && expense.trim().length > 0)
      return true;

    return false;
  }

  isValidBuyer(buyer: string) {
    if(buyer !== undefined && buyer.trim().length > 0)
      return true;

    return false;
  }

  isValidDate(date: string) {
    if(date !== undefined && date.trim().length > 0)
      return true;

    return false;
  }

  close() {
    this.expense.expenseDate = DateUtils.ngbDateStructToDateString(this.model);
    this.modalService.close(this.expense);
  }
}
