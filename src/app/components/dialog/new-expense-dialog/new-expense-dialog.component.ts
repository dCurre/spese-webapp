import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import Constants from 'src/app/constants/constants';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Expense } from 'src/app/services/firestore/expense/expense';
import { ExpenseService } from 'src/app/services/firestore/expense/expense.service';
import { ExpensesListService } from 'src/app/services/firestore/expensesList/expenses-list.service';
import { UserService } from 'src/app/services/firestore/user/user.service';
import DateUtils from 'src/app/utils/date-utils';
import GenericUtils from 'src/app/utils/generic-utils';
import ListUtils from 'src/app/utils/list-utils';
import MathUtils from 'src/app/utils/math-utils';
import StringUtils from 'src/app/utils/string-utils';

@Component({
  selector: 'app-new-expense-dialog',
  templateUrl: './new-expense-dialog.component.html',
  styleUrls: ['./new-expense-dialog.component.css']
})

export class NewExpenseDialogComponent implements OnInit {

  @Input() listID: string;
  @Input() action: String;
  @Input() expense: Expense;

  protected newExpense: Expense;
  protected partecipantsTooltip: string[] = [];
  protected expenseTooltip: string[] = [];
  protected maxInputText = Constants.maxInputText;
  
  model: NgbDateStruct;

  constructor(public modalService: NgbActiveModal,
    private expensesListService: ExpensesListService,
    private expenseService: ExpenseService,
    private userService: UserService,
    private authService: AuthService) { }

  ngOnInit(): void {
    this.newExpense = Object.assign({}, this.expense);

    this.getUserList(this.listID);
    this.getExpensesList(this.listID);
    this.setDefaultFields()
  }

  setDefaultFields() {
    if(GenericUtils.isNullOrUndefined(this.newExpense.expense)) this.newExpense.expense = "";
    if(GenericUtils.isNullOrUndefined(this.newExpense.amount)) this.newExpense.amount = 0;
    if(GenericUtils.isNullOrUndefined(this.newExpense.expenseDateTimestamp) || !StringUtils.equalsIgnoreCase("Modifica", this.action)) this.newExpense.expenseDateTimestamp = DateUtils.getNowTimestamp();
    this.model = DateUtils.dateTongbDateStruct(new Date(this.newExpense.expenseDateTimestamp * 1000));
    this.newExpense.expenseDate = DateUtils.ngbDateStructToDateString(this.model);
    if(GenericUtils.isNullOrUndefined(this.newExpense.buyer)) this.newExpense.buyer =  "";
  }

  selectToday() {
    this.model = DateUtils.dateTongbDateStruct(new Date());
  }

  isValid(expense: Expense) {
    return this.isValidExpense(expense.expense)
      && this.isValidAmount(expense.amount)
      && this.isValidDate(expense.expenseDate)
      && this.isValidBuyer(expense.buyer);
  }

  isValidAmount(amount: number) {
    return MathUtils.isMoreThanZero(amount);
  }

  isValidExpense(expense: string) {
    return !StringUtils.isNullOrEmpty(expense) && expense.trim().length <= this.maxInputText;
  }

  isValidBuyer(buyer: string) {
    return !StringUtils.isNullOrEmpty(buyer);
  }

  isValidDate(date: string) {
    if (GenericUtils.isNullOrUndefined(date) && date.trim().length > 0)
      return true;

    return false;
  }

  close() {
    this.newExpense.expenseDate = DateUtils.ngbDateStructToDateString(this.model);
    
    if(!StringUtils.equalsIgnoreCase("Modifica", this.action)){
      this.newExpense.lastModifiedDateTimestamp = 0;
      this.newExpense.modifiedBy = "";
      this.expenseService.insert(this.newExpense, this.listID);
    } else {
      this.authService.getLoggedUser().subscribe(user => {
        this.newExpense.lastModifiedDateTimestamp = DateUtils.dateToTimestamp(new Date());
        this.newExpense.modifiedBy = user.fullname
        this.expenseService.update(this.newExpense);
      })
    }
    this.modalService.close();
  }

  async getUserList(id: string) {
    try {
      this.expensesListService.getById(id).subscribe(expensesList => {
        this.partecipantsTooltip = []
        expensesList.partecipants.forEach(partecipantID => {
          this.userService.getById(partecipantID).subscribe(user => {
            if (!ListUtils.contains(this.partecipantsTooltip, user.fullname)) {
              this.partecipantsTooltip.push(user.fullname)
            }
          });
        });
      })
    } catch (e) {
      console.error("NewExpenseDialogComponent.getUserList: ", e)
    }
  }

  async getExpensesList(id: string) {
    try {
      this.expenseService.getExpensesByListID(id).subscribe(expensesList => {
        this.expenseTooltip = []
        expensesList.forEach(expense => {
          //Se non è già presente, aggiungo
          if (!ListUtils.contains(this.expenseTooltip, expense.expense)) {
            this.expenseTooltip.push(expense.expense)
          }
        });
      })
    } catch (e) {
      console.error("NewExpenseDialogComponent.getExpensesList: ", e)
    }
  }
}
