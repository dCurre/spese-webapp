import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import Constants from 'src/app/constants/constants';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Expense } from 'src/app/services/firestore/expense/expense';
import { ExpenseService } from 'src/app/services/firestore/expense/expense.service';
import { ExpensesListService } from 'src/app/services/firestore/expensesList/expenses-list.service';
import { UserService } from 'src/app/services/firestore/user/user.service';
import DateUtils from 'src/app/utils/date-utils';
import ListUtils from 'src/app/utils/list-utils';
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
    if (this.newExpense.expense == undefined) this.newExpense.expense = "";
    if (this.newExpense.amount == undefined) this.newExpense.amount = 0;
    if(this.newExpense.expenseDateTimestamp == undefined || !StringUtils.equalsIgnoreCase("Modifica", this.action)) this.newExpense.expenseDateTimestamp = DateUtils.getNowTimestamp();
    this.model = DateUtils.dateTongbDateStruct(new Date(this.newExpense.expenseDateTimestamp * 1000));
    this.newExpense.expenseDate = DateUtils.ngbDateStructToDateString(this.model);
    if (this.newExpense.buyer == undefined) this.newExpense.buyer =  "";
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
