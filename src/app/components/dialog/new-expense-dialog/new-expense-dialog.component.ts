import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal, NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import Constants from 'src/app/constants/constants';
import { Expense } from 'src/app/services/firestore/expense/expense';
import { ExpenseService } from 'src/app/services/firestore/expense/expense.service';
import { ExpensesListService } from 'src/app/services/firestore/expensesList/expenses-list.service';
import { UserService } from 'src/app/services/firestore/user/user.service';
import DateUtils from 'src/app/utils/date-utils';

@Component({
  selector: 'app-new-expense-dialog',
  templateUrl: './new-expense-dialog.component.html',
  styleUrls: ['./new-expense-dialog.component.css']
})


export class NewExpenseDialogComponent implements OnInit {

  @Input() defaultExpense: String;
  @Input() defaultAmount: String;
  @Input() defaultDate: String;
  @Input() defaultBuyer: String;
  @Input() action: String;

  protected expense: Expense;
  protected partecipants: string[] = [];
  protected expenses$: Observable<Expense[]>;
  protected maxInputText = Constants.maxInputText;
  listID: string;
  model: NgbDateStruct;

  constructor(public modalService: NgbActiveModal,
    private calendar: NgbCalendar,
    private expensesListService: ExpensesListService,
    private expenseService: ExpenseService,
    private userService: UserService) { }

  ngOnInit(): void {
    this.expense = new Expense();
    this.model = this.calendar.getToday();
    
    this.getUserList(this.listID);
    this.getExpensesList(this.listID);
    this.setDefaultFields()
  }

  setDefaultFields() {
    this.expense.expense = (this.defaultExpense !== undefined) ? this.defaultExpense.toString() : "";
    this.expense.amount = (this.defaultAmount !== undefined) ? +this.defaultAmount : 0;
    this.expense.expenseDate = (this.defaultDate !== undefined) ? this.defaultDate.toString() : DateUtils.ngbDateStructToDateString(this.model);
    this.expense.buyer = (this.defaultBuyer !== undefined) ? this.defaultBuyer.toString() : "";
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
    if (expense !== undefined && expense.trim().length <= this.maxInputText && expense.trim().length > 0)
      return true;

    return false;
  }

  isValidBuyer(buyer: string) {
    if (buyer !== undefined && buyer.trim().length > 0)
      return true;

    return false;
  }

  isValidDate(date: string) {
    if (date !== undefined && date.trim().length > 0)
      return true;

    return false;
  }

  close() {
    this.expense.expenseDate = DateUtils.ngbDateStructToDateString(this.model);
    this.modalService.close(this.expense);
  }

  async getUserList(id: string) {
    try {
      this.expensesListService.getById(id).subscribe(expensesList => {
        expensesList.partecipants.forEach(element => {
          this.userService.getById(element).subscribe(user => {
            this.partecipants.push(user.fullname)
          });
        });
      })
    } catch (e) {
      console.error("NewExpenseDialogComponent.getUserList: ", e)
    }
  }

  async getExpensesList(id: string) {
    try {
      this.expenses$ = this.expenseService.getExpensesByListID(id);
    } catch (e) {
      console.error("NewExpenseDialogComponent.getExpensesList: ", e)
    }
  }
}
