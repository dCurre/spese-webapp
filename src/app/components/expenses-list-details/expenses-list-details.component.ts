import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ExpenseService } from '../../services/firestore/expense/expense.service';
import { Expense } from '../../services/firestore/expense/expense';
import { ExpensesList } from '../../services/firestore/expensesList/expenses-list';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ExpensesListService } from 'src/app/services/firestore/expensesList/expenses-list.service';
import DateUtils from 'src/app/utils/date-utils';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NewExpenseDialogComponent } from '../dialog/new-expense-dialog/new-expense-dialog.component';
import { DialogComponent } from '../dialog/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogFields } from '../dialog/confirm-dialog/confirm-dialog-fields';

@Component({
  selector: 'app-expenses-list-details',
  templateUrl: './expenses-list-details.component.html',
  styleUrls: ['./expenses-list-details.component.css']
})
export class ExpenseListDetailsComponent implements OnInit {

  protected expenses$: Observable<Expense[]>;
  protected expensesList$: Observable<ExpensesList>;

  constructor(
    public afAuth: AngularFireAuth,
    private expenseService: ExpenseService,
    protected expensesListService: ExpensesListService,
    private modalService: NgbModal,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.getExpensesByListId(this.route.snapshot.paramMap.get('id')!!)
    this.getExpensesListDetails(this.route.snapshot.paramMap.get('id')!!)
  }

  async getExpensesByListId(id: string) {
    try {
      this.expenses$ = this.expenseService.getExpensesByListID(id);
    } catch (e) {
      console.error("ExpenseListDetailsComponent.getExpensesByListId: ", e)
    }
  }

  async getExpensesListDetails(id: string) {
    try {
      this.expensesList$ = this.expensesListService.getById(id);
    } catch (e) {
      console.error("ExpenseListDetailsComponent.getExpensesListDetails: ", e)
    }
  }

  newExpense() {
    const modalInsert = this.modalService.open(NewExpenseDialogComponent, { centered: true });
    modalInsert.componentInstance.listID = this.route.snapshot.paramMap.get('id')!!;
    modalInsert.componentInstance.action = 'Crea'

    modalInsert.result.then((response) => {
      if (response == null) {
        return
      }
      this.expenseService.insert(response, this.route.snapshot.paramMap.get('id')!!);
    }).catch((res) => { });
  }

  edit(expense: Expense) {
    const modalInsert = this.modalService.open(NewExpenseDialogComponent, { centered: true });
    modalInsert.componentInstance.listID = this.route.snapshot.paramMap.get('id')!!;
    modalInsert.componentInstance.action = 'Modifica'
    modalInsert.componentInstance.defaultExpense = expense.expense
    modalInsert.componentInstance.defaultAmount = expense.amount
    modalInsert.componentInstance.defaultDate = expense.expenseDate
    modalInsert.componentInstance.defaultBuyer = expense.buyer

    modalInsert.result.then((response) => {
      if (response == null) {
        return
      }

      expense.expense = response.expense
      expense.amount = response.amount
      expense.expenseDate = response.expenseDate
      expense.buyer = response.buyer

      this.expenseService.update(expense);
    }).catch((res) => { });
  }

  delete(expense: Expense) {
    const modalDelete = this.modalService.open(DialogComponent, { centered: true });
    modalDelete.componentInstance.dialogFields = new ConfirmDialogFields(
      'Elimina',
      "Vuoi veramente eliminare la spesa " + expense.expense);

    modalDelete.result.then((response) => {
      if (!response) {
        return
      }

      this.expenseService.delete(expense.id);
    }).catch((res) => { });
  }

  timestampToDate(timestamp: number) {
    return DateUtils.timestampToDate(timestamp);
  }

  timestampToHour(timestamp: number) {
    return DateUtils.timestampToHour(timestamp);
  }
}
