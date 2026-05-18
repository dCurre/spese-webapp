import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Expense } from 'src/app/core/services/postgres/expense/expense';
import { ExpenseService } from 'src/app/core/services/postgres/expense/expense.service';
import { ExpensesListParticipant } from 'src/app/core/services/postgres/expenses-list/expenses-list-participant';
import { ExpensesListParticipantService } from 'src/app/core/services/postgres/expenses-list/expenses-list-participant.service';
import { UserService } from 'src/app/core/services/postgres/user/user.service';
import Constants from 'src/app/shared/constants/constants';
import DateUtils from 'src/app/shared/utils/date-utils';
import GenericUtils from 'src/app/shared/utils/generic-utils';
import ListUtils from 'src/app/shared/utils/list-utils';
import MathUtils from 'src/app/shared/utils/math-utils';
import StringUtils from 'src/app/shared/utils/string-utils';

@Component({
  selector: 'app-new-expense-dialog',
  templateUrl: './new-expense-dialog.component.html',
  styleUrls: ['./new-expense-dialog.component.css']
})
export class NewExpenseDialogComponent implements OnInit {

  @Input() listID: number;
  @Input() action: string;
  @Input() expense: Expense;

  protected newExpense: Partial<Expense> = {};
  protected participants: ExpensesListParticipant[] = [];
  protected expenseTooltip: string[] = [];
  protected maxInputText = Constants.maxInputText;
  protected selectedBuyerName: string = '';
  protected touched = { name: false, amount: false, buyer: false, date: false };

  model: NgbDateStruct;

  constructor(
    public modalService: NgbActiveModal,
    private pgExpenseService: ExpenseService,
    private pgParticipantService: ExpensesListParticipantService,
    private pgUserService: UserService,
    private afAuth: AngularFireAuth,
  ) {}

  ngOnInit(): void {
    this.newExpense = this.expense ? Object.assign({}, this.expense) : {};
    this.getParticipants(this.listID);
    this.getExpenseTooltip(this.listID);
    this.setDefaultFields();
  }

  setDefaultFields() {
    if (GenericUtils.isNullOrUndefined(this.newExpense.name)) this.newExpense.name = '';
    if (GenericUtils.isNullOrUndefined(this.newExpense.amount)) this.newExpense.amount = 0;

    const date = this.newExpense.expense_date && StringUtils.equalsIgnoreCase('Modifica', this.action)
      ? new Date(this.newExpense.expense_date)
      : new Date();

    this.model = DateUtils.dateTongbDateStruct(date);

    if (this.expense?.owner) {
      this.selectedBuyerName = `${this.expense.owner.name} ${this.expense.owner.surname}`;
    }
  }

  selectToday() {
    this.model = DateUtils.dateTongbDateStruct(new Date());
  }

  getParticipants(listId: number) {
    this.pgParticipantService.getByListId(listId).subscribe({
      next: (res) => this.participants = res.participants,
      error: (e) => console.error('NewExpenseDialogComponent.getParticipants: ', e)
    });
  }

  getExpenseTooltip(listId: number) {
    this.pgExpenseService.getByListId(listId).subscribe({
      next: (res) => {
        this.expenseTooltip = [];
        res.expenses.forEach(e => {
          if (!ListUtils.contains(this.expenseTooltip, e.name)) {
            this.expenseTooltip.push(e.name);
          }
        });
      },
      error: (e) => console.error('NewExpenseDialogComponent.getExpenseTooltip: ', e)
    });
  }

  isValid(): boolean {
    return this.isValidExpense(this.newExpense.name!)
      && this.isValidAmount(this.newExpense.amount!)
      && !!this.selectedBuyerName
      && !!this.model;
  }

  isValidAmount(amount: number) { return MathUtils.isMoreThanZero(amount); }
  isValidExpense(name: string) { return !StringUtils.isNullOrEmpty(name) && name.trim().length <= this.maxInputText; }

  async close() {
    const expenseDate = DateUtils.ngbDateStructToDateString(this.model);
    const buyer = this.participants.find(p => `${p.name} ${p.surname}` === this.selectedBuyerName);
    if (!buyer) return;

    if (!StringUtils.equalsIgnoreCase('Modifica', this.action)) {
      this.pgExpenseService.create({
        name: this.newExpense.name,
        amount: this.newExpense.amount,
        expense_owner_user_id: buyer.user_id,
        expense_list_id: this.listID,
        expense_date: expenseDate,
      }).subscribe({
        next: () => this.modalService.close(),
        error: (e) => console.error('NewExpenseDialogComponent.close insert: ', e)
      });
    } else {
      const firebaseUser = await this.afAuth.currentUser;
      let modifiedById: number | undefined;
      if (firebaseUser?.email) {
        const pgUser = await this.pgUserService.getByEmail(firebaseUser.email).toPromise();
        modifiedById = pgUser?.id;
      }

      this.pgExpenseService.update(this.newExpense.id!, {
        name: this.newExpense.name,
        amount: this.newExpense.amount,
        expense_date: expenseDate,
        expense_owner_user_id: buyer.user_id,
        modified_by: modifiedById,
      }).subscribe({
        next: () => this.modalService.close(),
        error: (e) => console.error('NewExpenseDialogComponent.close update: ', e)
      });
    }
  }
}
