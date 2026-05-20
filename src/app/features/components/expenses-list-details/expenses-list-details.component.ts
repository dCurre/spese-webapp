import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from 'rxjs';
import { NewExpenseDialogComponent } from '../dialog/new-expense-dialog/new-expense-dialog.component';
import { DialogComponent } from '../dialog/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogFields } from '../dialog/confirm-dialog/confirm-dialog-fields';
import { ShareDialogComponent } from '../dialog/share-dialog/share-dialog.component';
import { SaldoDetails } from '../saldo-details/list-details-dialog-fields';
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
  protected sortBy: 'name' | 'date' | 'amount' = 'date';
  protected sortAsc = false;

  protected balanceDetails: SaldoDetails[] = [];
  protected mapPagato = new Map<string, number>();
  protected balanceOpen = window.innerWidth > 768;
  protected drawerOpen = false;

  protected readonly expenseTypeIcons: Record<string, string> = {
    'Alimentari':   'fa-basket-shopping',
    'Ristorante':   'fa-utensils',
    'Trasporti':    'fa-car',
    'Alloggio':     'fa-house',
    'Svago':        'fa-masks-theater',
    'Salute':       'fa-heart-pulse',
    'Abbigliamento':'fa-shirt',
    'Utenze':       'fa-bolt',
    'Altro':        'fa-circle-question',
  };

  expenseTypeIcon(type: string | null): string {
    return type ? (this.expenseTypeIcons[type] ?? 'fa-tag') : 'fa-tag';
  }

  private readonly expenseTypeAccents: Record<string, string> = {
    'Alimentari':    '#00d88a',
    'Ristorante':    '#f59e0b',
    'Trasporti':     '#a78bfa',
    'Alloggio':      '#60a5fa',
    'Svago':         '#f59e0b',
    'Salute':        '#f87171',
    'Abbigliamento': '#e879f9',
    'Utenze':        '#f87171',
    'Altro':         '#7b849e',
  };

  expenseTypeAccent(type: string | null): string {
    return type ? (this.expenseTypeAccents[type] ?? '#00b37e') : '#00b37e';
  }

  togglePanel(i: number) { this.openPanel = this.openPanel === i ? null : i; }

  get sortedExpenses(): Expense[] {
    let list = this.searchTerm?.trim()
      ? this.expenses.filter(e => e.name.toLowerCase().includes(this.searchTerm.trim().toLowerCase()))
      : [...this.expenses];
    list = list.sort((a, b) => {
      let cmp = 0;
      if (this.sortBy === 'name') cmp = a.name.localeCompare(b.name);
      else if (this.sortBy === 'amount') cmp = Number(a.amount) - Number(b.amount);
      else cmp = new Date(a.expense_date).getTime() - new Date(b.expense_date).getTime();
      return this.sortAsc ? cmp : -cmp;
    });
    return list;
  }

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
    this.loadData(this.listID);
  }

  ngOnDestroy() {
    this.modalService.dismissAll();
  }

  private loadData(id: number) {
    forkJoin({
      list: this.pgExpensesListService.getById(id),
      expenses: this.pgExpenseService.getByListId(id),
    }).subscribe({
      next: ({ list, expenses: res }) => {
        this.expensesList = list;
        this.expenses = res.expenses;
        this.expensesListTotalAmount = res.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
        this.expensesLoaded = true;
        this.computeBalance(res.expenses);
      },
      error: (e) => console.error('ExpenseListDetailsComponent.loadData: ', e)
    });
  }

  reloadExpenses() {
    this.pgExpenseService.getByListId(this.listID).subscribe({
      next: (res) => {
        this.expenses = res.expenses;
        this.expensesListTotalAmount = res.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
        this.computeBalance(res.expenses);
      },
      error: (e) => console.error('ExpenseListDetailsComponent.reloadExpenses: ', e)
    });
  }

  private computeBalance(expenses: Expense[]) {
    this.mapPagato = new Map();
    expenses.forEach(e => {
      const buyer = `${e.owner.name} ${e.owner.surname}`;
      this.mapPagato.set(buyer, (this.mapPagato.get(buyer) ?? 0) + Number(e.amount));
    });

    this.balanceDetails = [];
    this.mapPagato.forEach((buyerPaid, buyer) => {
      this.mapPagato.forEach((receiverPaid, receiver) => {
        if (buyer !== receiver) {
          this.balanceDetails.push(new SaldoDetails(buyer, receiver, (receiverPaid - buyerPaid) / this.mapPagato.size));
        }
      });
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

      if ((expensesList.participants?.length ?? 0) == 1) {
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
      expensesList.list_type === 'personal'
        ? 'Vuoi veramente eliminare ' + expensesList.name + '?'
        : 'Sei l\'unico componente di ' + expensesList.name + '.\nVuoi veramente cancellarla?'
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
