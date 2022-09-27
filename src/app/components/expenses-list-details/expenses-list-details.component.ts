import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ExpenseService } from '../../services/firestore/expense/expense.service';
import { Expense } from '../../services/firestore/expense/expense';
import { ExpensesList } from '../../services/firestore/expensesList/expenses-list';
import { first, Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ExpensesListService } from 'src/app/services/firestore/expensesList/expenses-list.service';
import DateUtils from 'src/app/utils/date-utils';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NewExpenseDialogComponent } from '../dialog/new-expense-dialog/new-expense-dialog.component';
import { DialogComponent } from '../dialog/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogFields } from '../dialog/confirm-dialog/confirm-dialog-fields';
import MathUtils from 'src/app/utils/math-utils';
import { ConstantsService } from 'src/app/services/firestore/constants/constants.service';
import { ShareDialogComponent } from '../dialog/share-dialog/share-dialog.component';

@Component({
  selector: 'app-expenses-list-details',
  templateUrl: './expenses-list-details.component.html',
  styleUrls: ['./expenses-list-details.component.css']
})
export class ExpenseListDetailsComponent implements OnInit {

  protected expenses$: Observable<Expense[]>;
  protected expensesList$: Observable<ExpensesList>;
  protected expensesListTotalAmount: number = 0;
  private listID: string;

  constructor(
    public afAuth: AngularFireAuth,
    private expenseService: ExpenseService,
    protected expensesListService: ExpensesListService,
    private constantsService: ConstantsService,
    private modalService: NgbModal,
    private route: ActivatedRoute,) { }

  ngOnInit(): void {
    this.listID = this.route.snapshot.paramMap.get('id')!!
    this.getExpensesByListId(this.listID)
    this.getExpensesListDetails(this.listID)
    this.getExpensesListTotal(this.listID)
  }

  getExpensesByListId(id: string) {
    try {
      this.expenses$ = this.expenseService.getExpensesByListID(id);
    } catch (e) {
      console.error("ExpenseListDetailsComponent.getExpensesByListId: ", e)
    }
  }

  async getExpensesListDetails(id: string) {
    try {
      this.expensesList$ = this.expensesListService.getById(id).pipe(first());
    } catch (e) {
      console.error("ExpenseListDetailsComponent.getExpensesListDetails: ", e)
    }
  }

  newExpense() {
    const modalInsert = this.modalService.open(NewExpenseDialogComponent, { centered: true });
    modalInsert.componentInstance.listID = this.listID;
    modalInsert.componentInstance.action = 'Crea'

    modalInsert.result.then((response) => {
      if (response == null) {
        return
      }
      this.expenseService.insert(response, this.listID);
    }).catch((res) => { });
  }

  edit(expense: Expense) {
    const modalInsert = this.modalService.open(NewExpenseDialogComponent, { centered: true });
    modalInsert.componentInstance.listID = this.listID;
    modalInsert.componentInstance.action = 'Modifica'
    modalInsert.componentInstance.defaultExpense = expense.expense
    modalInsert.componentInstance.defaultAmount = expense.amount
    modalInsert.componentInstance.defaultDateTimestamp = expense.expenseDateTimestamp
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

  timestampToDateString(timestamp: number) {
    return DateUtils.timestampToDateString(timestamp);
  }

  timestampToHourString(timestamp: number) {
    return DateUtils.timestampToHourString(timestamp);
  }

  getExpensesListTotal(id: string) {
    try {
      this.expenseService.getExpensesByListID(id).subscribe(expenseList => {
        this.expensesListTotalAmount = 0;
        expenseList.forEach(expense => {
          this.expensesListTotalAmount += expense.amount;
        })
      });
    } catch (e) {
      console.error("ExpenseListDetailsComponent.getExpensesListTotal: ", e)
    }
  }

  formatToEur(amount: number) {
    return MathUtils.formatToEur(amount);
  }

  shareLink() {
    const listID = this.listID;
    const modalShare = this.modalService.open(ShareDialogComponent, { centered: true });
    this.constantsService.getConstants().pipe(first()).subscribe(constants => {
      modalShare.componentInstance.shareLink = constants.shareLink.replace("{LIST_ID}", listID)
    })

    modalShare.result.then((response) => {
      if (!response) {
        return
      }

    }).catch((res) => { });
  }

  leave(expensesList: ExpensesList) {
    const modalLeave = this.modalService.open(DialogComponent, { centered: true });
    modalLeave.componentInstance.dialogFields = new ConfirmDialogFields(
      'Abbandona',
      'Vuoi veramente abbandonare ' + expensesList.name + '?');

    modalLeave.result.then(response => {
      console.debug(`Modal response: ${response}`)

      if (!response) {
        return
      }

      //Controllo che l'utente non sia l'unico della lista
      //Se il partecipante alla lista è solo 1, allora per abbandonarla deve confermare la cancellazione
      if (expensesList.partecipants.length == 1) {
        this.deleteList(expensesList)
      } else {
        //Se non è l'unico in lista, il nuovo owner diventa il primo presente nella lista partecipanti (first-in)
        this.afAuth.authState.subscribe(user => {
          this.expensesListService.leave(user!!.uid, expensesList);
        })
      }
    }).catch((res) => { })
  }

  deleteList(expensesList: ExpensesList) {
    const modalDelete = this.modalService.open(DialogComponent, { centered: true });
    modalDelete.componentInstance.dialogFields = new ConfirmDialogFields(
      'Elimina',
      "Sei l'unico componente di " + expensesList.name + ".\nVuoi veramente cancellarla?");

    modalDelete.result.then((response) => {
      if (!response) {
        return
      }

      this.expensesListService.delete(expensesList.id);
    }).catch((res) => { });
  }

  salda(expensesList: ExpensesList) {
    const modalSaldo = this.modalService.open(DialogComponent, { centered: true });
    const saldoMessage = expensesList.paid ? "Vuoi riaprire la lista " : "Vuoi chiudere la lista "

    modalSaldo.componentInstance.dialogFields = new ConfirmDialogFields(
      'Conferma saldo',
      saldoMessage + expensesList.name + "?");

    modalSaldo.result.then((response) => {
      if (!response) {
        return
      }

      expensesList.paid = !expensesList.paid
      this.expensesListService.update(expensesList);

    }).catch((res) => { });
  }
}
