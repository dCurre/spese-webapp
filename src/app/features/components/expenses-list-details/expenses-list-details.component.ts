import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin, Subscription } from 'rxjs';
import { RealtimeService } from 'src/app/core/services/realtime/realtime.service';
import { NewExpenseDialogComponent } from '../dialog/new-expense-dialog/new-expense-dialog.component';
import { DialogComponent } from '../dialog/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogFields } from '../dialog/confirm-dialog/confirm-dialog-fields';
import { ShareDialogComponent } from '../dialog/share-dialog/share-dialog.component';
import { AddGuestDialogComponent } from '../dialog/add-guest-dialog/add-guest-dialog.component';

import { SaldoDetails } from '../saldo-details/list-details-dialog-fields';
import { Expense } from 'src/app/core/services/postgres/expense/expense';
import { ExpenseService } from 'src/app/core/services/postgres/expense/expense.service';
import { ExpensesList } from 'src/app/core/services/postgres/expenses-list/expenses-list';
import { ExpensesListService } from 'src/app/core/services/postgres/expenses-list/expenses-list.service';
import { ExpensesListActionsService } from 'src/app/core/services/postgres/expenses-list/expenses-list-actions.service';
import { UserService } from 'src/app/core/services/postgres/user/user.service';
import { ExpensesListParticipantService } from 'src/app/core/services/postgres/expenses-list/expenses-list-participant.service';
import DateUtils from 'src/app/shared/utils/date-utils';
import MathUtils from 'src/app/shared/utils/math-utils';
import ListUtils from 'src/app/shared/utils/list-utils';
import { expenseTypeIcon, expenseTypeAccent } from 'src/app/shared/utils/expense-type.utils';

@Component({
  selector: 'app-expenses-list-details',
  templateUrl: './expenses-list-details.component.html',
  styleUrls: ['./expenses-list-details.component.css']
})
export class ExpenseListDetailsComponent implements OnInit, OnDestroy {

  protected expenses: Expense[] = [];
  protected expensesList: ExpensesList | null = null;
  protected expensesListTotalAmount: number = 0;
  protected expensesLoaded = false;
  private listID: number;
  protected searchTerm: string;
  protected panelOpenState = false;
  protected openPanel: number | null = null;
  protected sortBy: 'name' | 'date' | 'amount' = 'date';
  protected sortAsc = false;

  protected balanceDetails: SaldoDetails[] = [];
  protected balanceTotals: { name: string; amount: number }[] = [];
  protected balanceOpen = window.innerWidth > 768;
  protected drawerOpen = false;
  private realtimeSub: Subscription | null = null;

  readonly expenseTypeIcon = expenseTypeIcon;
  readonly expenseTypeAccent = expenseTypeAccent;

  togglePanel(i: number) { this.openPanel = this.openPanel === i ? null : i; }

  get sortedExpenses(): Expense[] {
    return ListUtils.filterAndSortExpenses(this.expenses, this.searchTerm, this.sortBy, this.sortAsc);
  }

  constructor(
    private pgExpenseService: ExpenseService,
    private pgExpensesListService: ExpensesListService,
    private pgUserService: UserService,
    private pgParticipantService: ExpensesListParticipantService,
    private listActionsService: ExpensesListActionsService,
    private modalService: NgbModal,
    private route: ActivatedRoute,
    public router: Router,
    private realtimeService: RealtimeService,
  ) { }

  ngOnInit(): void {
    this.listID = Number(this.route.snapshot.paramMap.get('id'));
    this.loadData(this.listID);
    this.subscribeRealtime();
  }

  ngOnDestroy() {
    this.modalService.dismissAll();
    this.realtimeSub?.unsubscribe();
  }

  private subscribeRealtime(): void {
    this.realtimeSub = this.realtimeService.watch('expenses', 'spese')
      .subscribe((payload: any) => {
        const row = payload?.new ?? payload?.old;
        if (row?.expense_list_id === this.listID) this.reloadExpenses();
      });
  }

  private loadData(id: number) {
    forkJoin({
      list: this.pgExpensesListService.getById(id),
      expenses: this.pgExpenseService.getByListId(id),
      balance: this.pgExpensesListService.getBalance(id),
    }).subscribe({
      next: ({ list, expenses: res, balance }) => {
        this.expensesList = list;
        this.expenses = res.expenses;
        this.expensesListTotalAmount = MathUtils.totalAmount(res.expenses);
        this.expensesLoaded = true;
        this.balanceDetails = balance.balance;
        this.balanceTotals = balance.totals;
      },
      error: (e) => console.error('ExpenseListDetailsComponent.loadData: ', e)
    });
  }

  reloadExpenses() {
    forkJoin({
      expenses: this.pgExpenseService.getByListId(this.listID),
      balance: this.pgExpensesListService.getBalance(this.listID),
    }).subscribe({
      next: ({ expenses: res, balance }) => {
        this.expenses = res.expenses;
        this.expensesListTotalAmount = MathUtils.totalAmount(res.expenses);
        this.balanceDetails = balance.balance;
        this.balanceTotals = balance.totals;
      },
      error: (e) => console.error('ExpenseListDetailsComponent.reloadExpenses: ', e)
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
    modalInsert.result.then(() => this.reloadExpenses()).catch(() => {});
  }

  delete(expense: Expense) {
    const modalDelete = this.modalService.open(DialogComponent, { centered: true });
    modalDelete.componentInstance.dialogFields = new ConfirmDialogFields(
      'Elimina',
      'Vuoi veramente eliminare la spesa ' + expense.name);

    modalDelete.result.then((response) => {
      if (!response) return;
      this.pgExpenseService.delete(expense.id).subscribe({
        next: () => this.reloadExpenses(),
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



  shareLink() {
    const link = `${window.location.origin}/join?list=${this.listID}`;
    const modalShare = this.modalService.open(ShareDialogComponent, { centered: true });
    modalShare.componentInstance.shareLink = link;
    modalShare.result.then(() => {}).catch(() => {});
  }

  addGuest() {
    const modal = this.modalService.open(AddGuestDialogComponent, { centered: true });
    modal.result.then((name: string) => {
      if (!name) return;
      this.pgUserService.create({ name, is_guest: true }).subscribe({
        next: (res) => {
          this.pgParticipantService.add(this.listID, res.id).subscribe({
            next: () => this.loadData(this.listID),
            error: (e) => console.error('addGuest add participant:', e)
          });
        },
        error: (e) => console.error('addGuest create user:', e)
      });
    }).catch(() => {});
  }

  removeGuest(userId: number) {
    const guest = this.expensesList?.participants?.find(p => p.user_id === userId);
    const name = guest ? guest.name : 'ospite';
    const modalDelete = this.modalService.open(DialogComponent, { centered: true });
    modalDelete.componentInstance.dialogFields = new ConfirmDialogFields(
      'Rimuovi ospite',
      `Vuoi rimuovere ${name} dalla lista?`
    );
    modalDelete.result.then((response) => {
      if (!response) return;
      this.pgParticipantService.removeGuest(this.listID, userId).subscribe({
        next: () => this.loadData(this.listID),
        error: (e) => console.error('removeGuest:', e)
      });
    }).catch(() => {});
  }

  leave(expensesList: ExpensesList) {
    this.listActionsService.deleteOrLeave(expensesList, () => this.router.navigate(['']));
  }

  deleteList(expensesList: ExpensesList) {
    this.listActionsService.deleteOrLeave(expensesList, () => this.router.navigate(['']));
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
