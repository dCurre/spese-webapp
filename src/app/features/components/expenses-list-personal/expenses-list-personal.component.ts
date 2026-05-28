import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { forkJoin } from 'rxjs';
import { NewExpenseDialogComponent } from '../dialog/new-expense-dialog/new-expense-dialog.component';
import { DialogComponent } from '../dialog/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogFields } from '../dialog/confirm-dialog/confirm-dialog-fields';
import { ShareDialogComponent } from '../dialog/share-dialog/share-dialog.component';
import { Expense } from 'src/app/core/services/postgres/expense/expense';
import { ExpenseService } from 'src/app/core/services/postgres/expense/expense.service';
import { ExpensesList } from 'src/app/core/services/postgres/expenses-list/expenses-list';
import { ExpensesListService } from 'src/app/core/services/postgres/expenses-list/expenses-list.service';
import { ExpensesListParticipantService } from 'src/app/core/services/postgres/expenses-list/expenses-list-participant.service';
import { UserService } from 'src/app/core/services/postgres/user/user.service';
import { environment } from 'src/environments/environment';
import DateUtils from 'src/app/shared/utils/date-utils';
import MathUtils from 'src/app/shared/utils/math-utils';
import ListUtils from 'src/app/shared/utils/list-utils';

@Component({
  selector: 'app-expenses-list-personal',
  templateUrl: './expenses-list-personal.component.html',
  styleUrls: ['./expenses-list-personal.component.css']
})
export class ExpensesListPersonalComponent implements OnInit {

  protected expenses: Expense[] = [];
  protected expensesList: ExpensesList | null = null;
  protected expensesListTotalAmount = 0;
  protected expensesLoaded = false;
  private listID: number;
  protected searchTerm = '';
  protected sortBy: 'name' | 'date' | 'amount' = 'date';
  protected sortAsc = false;
  protected openPanel: number | null = null;

  togglePanel(i: number) { this.openPanel = this.openPanel === i ? null : i; }

  get sortedExpenses(): Expense[] {
    return ListUtils.filterAndSortExpenses(this.expenses, this.searchTerm, this.sortBy, this.sortAsc);
  }

  constructor(
    public afAuth: AngularFireAuth,
    private pgExpenseService: ExpenseService,
    private pgExpensesListService: ExpensesListService,
    private pgParticipantService: ExpensesListParticipantService,
    private pgUserService: UserService,
    private modalService: NgbModal,
    private route: ActivatedRoute,
    public router: Router,
  ) {}

  ngOnInit(): void {
    this.listID = Number(this.route.snapshot.paramMap.get('id'));
    this.pgExpensesListService.getById(this.listID).subscribe({
      next: (list) => this.expensesList = list,
      error: (e) => console.error('ExpensesListPersonalComponent.getList: ', e)
    });
    this.pgExpenseService.getByListId(this.listID).subscribe({
      next: (res) => {
        this.expenses = res.expenses;
        this.expensesListTotalAmount = MathUtils.totalAmount(res.expenses);
        this.expensesLoaded = true;
      },
      error: (e) => console.error('ExpensesListPersonalComponent.getExpenses: ', e)
    });
  }

  ngOnDestroy() { this.modalService.dismissAll(); }

  newExpense(): Expense { return new Expense(); }

  openNewExpenseDialog(expense: Expense, action: string) {
    const modal = this.modalService.open(NewExpenseDialogComponent, { centered: true });
    modal.componentInstance.listID = this.listID;
    modal.componentInstance.action = action;
    modal.componentInstance.expense = expense;
    modal.result.then(() => this.reload()).catch(() => {});
  }

  private reload() {
    this.pgExpenseService.getByListId(this.listID).subscribe({
      next: (res) => {
        this.expenses = res.expenses;
        this.expensesListTotalAmount = MathUtils.totalAmount(res.expenses);
      },
      error: (e) => console.error('ExpensesListPersonalComponent.reload: ', e)
    });
  }

  delete(expense: Expense) {
    const modal = this.modalService.open(DialogComponent, { centered: true });
    modal.componentInstance.dialogFields = new ConfirmDialogFields('Elimina', 'Vuoi eliminare la spesa ' + expense.name + '?');
    modal.result.then((response) => {
      if (!response) return;
      this.pgExpenseService.delete(expense.id).subscribe({
        next: () => this.reload(),
        error: (e) => console.error('ExpensesListPersonalComponent.delete: ', e)
      });
    }).catch(() => {});
  }

  async salda(expensesList: ExpensesList) {
    const modal = this.modalService.open(DialogComponent, { centered: true });
    modal.componentInstance.dialogFields = new ConfirmDialogFields(
      'Conferma', (expensesList.paid ? 'Riaprire ' : 'Chiudere ') + expensesList.name + '?'
    );
    modal.result.then((response) => {
      if (!response) return;
      expensesList.paid = !expensesList.paid;
      this.pgExpensesListService.update(expensesList.id, { paid: expensesList.paid }).subscribe({
        error: (e) => console.error('ExpensesListPersonalComponent.salda: ', e)
      });
    }).catch(() => {});
  }

  async leave(expensesList: ExpensesList) {
    const modal = this.modalService.open(DialogComponent, { centered: true });
    modal.componentInstance.dialogFields = new ConfirmDialogFields('Elimina', 'Vuoi eliminare la lista ' + expensesList.name + '?');
    modal.result.then(async (response) => {
      if (!response) return;
      this.pgExpensesListService.delete(expensesList.id).subscribe({
        next: () => this.router.navigate(['']),
        error: (e) => console.error('ExpensesListPersonalComponent.leave: ', e)
      });
    }).catch(() => {});
  }

  expenseDateString(expense: Expense): string {
    return expense.expense_date ? DateUtils.dateToString(new Date(expense.expense_date)) : '';
  }

  hasBeenModified(expense: Expense): boolean {
    return !!expense.updated_at && !!expense.modified_by;
  }



  shareLink() {
    const link = `${environment.pgApiUrl.replace('localhost:5000', location.host)}/join?list=${this.listID}`;
    const modal = this.modalService.open(ShareDialogComponent, { centered: true });
    modal.componentInstance.shareLink = link;
    modal.result.then(() => {}).catch(() => {});
  }
}
