import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
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

@Component({
  selector: 'app-expenses-list-details',
  templateUrl: './expenses-list-details.component.html',
  styleUrls: ['./expenses-list-details.component.css']
})
export class ExpenseListDetailsComponent implements OnInit {

  protected expenses: Expense[] = [];
  protected expensesList: ExpensesList | null = null;
  protected expensesListTotalAmount: number = 0;
  protected expensesLoaded = false;
  private listID: number;
  protected searchTerm: string;
  protected panelOpenState = false;
  protected openPanel: number | null = null;
  togglePanel(i: number) { this.openPanel = this.openPanel === i ? null : i; }

  constructor(
    public afAuth: AngularFireAuth,
    private pgExpenseService: ExpenseService,
    private pgExpensesListService: ExpensesListService,
    private pgParticipantService: ExpensesListParticipantService,
    private pgUserService: UserService,
    private modalService: NgbModal,
    private route: ActivatedRoute,
    public router: Router) { }

  ngOnInit(): void {
    this.listID = Number(this.route.snapshot.paramMap.get('id'));
    this.getExpensesListDetails(this.listID);
    this.getExpensesByListId(this.listID);
  }

  ngOnDestroy() {
    this.modalService.dismissAll();
  }

  getExpensesByListId(id: number) {
    this.pgExpenseService.getByListId(id).subscribe({
      next: (res) => {
        this.expenses = res.expenses;
        this.expensesListTotalAmount = res.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
        this.expensesLoaded = true;
      },
      error: (e) => console.error('ExpenseListDetailsComponent.getExpensesByListId: ', e)
    });
  }

  getExpensesListDetails(id: number) {
    this.pgExpensesListService.getById(id).subscribe({
      next: (list) => this.expensesList = list,
      error: (e) => console.error('ExpenseListDetailsComponent.getExpensesListDetails: ', e)
    });
  }

  newExpense(): Expense {
    return new Expense();
  }

  openNewExpenseDialog(expense: Expense, action: string) {
    const modalInsert = this.modalService.open(NewExpenseDialogComponent, { centered: true });
    modalInsert.componentInstance.listID = this.listID;
    modalInsert.componentInstance.action = action;
    modalInsert.componentInstance.expense = expense;
    modalInsert.result.then(() => this.getExpensesByListId(this.listID)).catch(() => {});
  }

  delete(expense: Expense) {
    const modalDelete = this.modalService.open(DialogComponent, { centered: true });
    modalDelete.componentInstance.dialogFields = new ConfirmDialogFields(
      'Elimina',
      'Vuoi veramente eliminare la spesa ' + expense.name);

    modalDelete.result.then((response) => {
      if (!response) return;
      this.pgExpenseService.delete(expense.id).subscribe({
        next: () => this.getExpensesByListId(this.listID),
        error: (e) => console.error('ExpenseListDetailsComponent.delete: ', e)
      });
    }).catch(() => {});
  }

  expenseDateString(expense: Expense): string {
    return expense.expense_date ? DateUtils.dateToString(new Date(expense.expense_date)) : '';
  }

  hasBeenModified(expense: Expense): boolean {
    return !!expense.updated_at && !!expense.modified_by;
  }

  modifiedByName(expense: Expense): string {
    return expense.modified_by ? String(expense.modified_by) : '';
  }

  formatToEur(amount: number) {
    return MathUtils.formatToEur(amount);
  }

  shareLink() {
    const link = `${environment.pgApiUrl.replace('localhost:5000', location.host)}/join?list=${this.listID}`;
    const modalShare = this.modalService.open(ShareDialogComponent, { centered: true });
    modalShare.componentInstance.shareLink = link;
    modalShare.result.then(() => {}).catch(() => {});
  }

  async leave(expensesList: ExpensesList) {
    const modalLeave = this.modalService.open(DialogComponent, { centered: true });
    modalLeave.componentInstance.dialogFields = new ConfirmDialogFields(
      'Abbandona',
      'Vuoi veramente abbandonare ' + expensesList.name + '?');

    modalLeave.result.then(async response => {
      if (!response) return;

      if (expensesList.participants.length == 1) {
        this.deleteList(expensesList);
      } else {
        const firebaseUser = await this.afAuth.currentUser;
        if (!firebaseUser?.email) return;
        const pgUser = await this.pgUserService.getByEmail(firebaseUser.email).toPromise();
        if (!pgUser) return;
        this.pgParticipantService.remove(expensesList.id, pgUser.id).subscribe({
          next: () => this.router.navigate(['']),
          error: (e) => console.error('ExpenseListDetailsComponent.leave: ', e)
        });
      }
    }).catch(() => {});
  }

  deleteList(expensesList: ExpensesList) {
    const modalDelete = this.modalService.open(DialogComponent, { centered: true });
    modalDelete.componentInstance.dialogFields = new ConfirmDialogFields(
      'Elimina',
      'Sei l\'unico componente di ' + expensesList.name + '.\nVuoi veramente cancellarla?'
    );

    modalDelete.result.then((response) => {
      if (!response) return;
      this.pgExpensesListService.delete(expensesList.id).subscribe({
        next: () => this.router.navigate(['']),
        error: (e) => console.error('ExpenseListDetailsComponent.deleteList: ', e)
      });
    }).catch(() => {});
  }

  salda(expensesList: ExpensesList) {
    const modalSaldo = this.modalService.open(DialogComponent, { centered: true });
    const saldoMessage = expensesList.paid ? 'Vuoi riaprire la lista ' : 'Vuoi chiudere la lista ';

    modalSaldo.componentInstance.dialogFields = new ConfirmDialogFields(
      'Conferma saldo',
      saldoMessage + expensesList.name + '?'
    );

    modalSaldo.result.then((response) => {
      if (!response) return;
      expensesList.paid = !expensesList.paid;
      this.pgExpensesListService.update(expensesList.id, { paid: expensesList.paid }).subscribe({
        error: (e) => console.error('ExpenseListDetailsComponent.salda: ', e)
      });
    }).catch(() => {});
  }
}
