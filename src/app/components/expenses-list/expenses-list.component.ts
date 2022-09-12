import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ExpensesListService } from '../../services/firestore/expensesList/expenses-list.service';
import { ExpensesList } from '../../services/firestore/expensesList/expenses-list';
import { Observable } from 'rxjs';
import DateUtils from 'src/app/utils/date-utils';
import { DialogComponent } from 'src/app/components/dialog/confirm-dialog/confirm-dialog.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmDialogFields } from '../dialog/confirm-dialog/confirm-dialog-fields';
import { Router } from '@angular/router';
import { NewListDialogComponent } from '../dialog/new-list-dialog/new-list-dialog.component';

@Component({
  selector: 'app-expenses-list',
  templateUrl: './expenses-list.component.html',
  styleUrls: ['./expenses-list.component.css']
})

export class ExpensesListComponent implements OnInit {

  protected expensesLists$: Observable<ExpensesList[]>;
  protected loggedUserData$: any;
  closeResult: string;

  constructor(
    public afAuth: AngularFireAuth,
    private expensesListService: ExpensesListService,
    private modalService: NgbModal,
    public router: Router) { }

  ngOnInit(): void {
    this.getExpensesListsByLoggedUser()
    this.getLoggedUserData()
  }

  async getExpensesListsByLoggedUser() {
    console.log("getExpensesListsByLoggedUser");
    this.afAuth.authState.subscribe(user => {
      try {
        this.expensesLists$ = this.expensesListService.getByUserId(user!!.uid);
      } catch (e) {
        console.error("HomeComponent.getExpensesListsByLoggedUser: ", e)
      }
    })
  }

  timestampToDateString(timestamp: number) {
    return DateUtils.timestampToDateString(timestamp);
  }

  timestampToHourString(timestamp: number) {
    return DateUtils.timestampToHourString(timestamp);
  }

  leave(expensesList: ExpensesList) {
    console.log("leave");
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
        this.delete(expensesList)
      } else {
        //Se non è l'unico in lista, il nuovo owner diventa il primo presente nella lista partecipanti (first-in)
        this.afAuth.authState.subscribe(user => {
          this.expensesListService.leave(user!!.uid, expensesList);
        })
      }
    }).catch((res) => {})
  }

  delete(expensesList: ExpensesList) {
    console.log("delete");
    const modalDelete = this.modalService.open(DialogComponent, { centered: true });
    modalDelete.componentInstance.dialogFields = new ConfirmDialogFields(
      'Elimina',
      "Sei l'unico componente di " + expensesList.name + ".\nVuoi veramente cancellarla?");

    modalDelete.result.then((response) => {
      if (!response) {
        return
      }

      this.expensesListService.delete(expensesList.id);
    }).catch((res) => {});
  }

  newList() {
    const modalNewList = this.modalService.open(NewListDialogComponent, { centered: true });
    
    modalNewList.result.then((response) => {
      if (response == null) {
        return
      }

      this.afAuth.authState.subscribe(user => {
        this.expensesListService.insert(response, user!!.uid);
      })
    }).catch((res) => {});
  }

  getLoggedUserData(){
    console.log("getLoggedUserData");
    this.afAuth.authState.subscribe(user => {
      this.loggedUserData$ = user;
    })
  }
}
