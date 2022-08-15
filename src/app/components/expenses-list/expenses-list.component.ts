import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ExpensesListService } from '../../shared/services/firestore/expensesList/expenses-list.service';
import { ExpensesList } from '../../shared/services/firestore/expensesList/expenses-list';
import { map, Observable } from 'rxjs';
import { UserService } from 'src/app/shared/services/firestore/user/user.service';
import { UserFieldsEnum } from 'src/app/shared/enums/userFieldsEnum';
import { User } from 'src/app/shared/services/firestore/user/user';
import DateUtils from 'src/app/utils/date-utils';
import { DialogComponent } from '../dialog/dialog.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DialogFields } from '../dialog/DialogFields';

@Component({
  selector: 'app-expenses-list',
  templateUrl: './expenses-list.component.html',
  styleUrls: ['./expenses-list.component.css']
})

export class ExpensesListComponent implements OnInit {

  protected expensesLists$: Observable<ExpensesList[]>;
  protected listOwner$: Observable<User>;
  closeResult: string;

  constructor(
    public afAuth: AngularFireAuth,
    private expensesListService: ExpensesListService,
    private userService: UserService,
    private modalService: NgbModal) { }

  ngOnInit(): void {
    this.getExpensesListsByLoggedUser()
    this.getListOwner()
  }

  async getExpensesListsByLoggedUser() {

    this.afAuth.authState.subscribe(user => {
      try {
        this.expensesLists$ = this.expensesListService.getByUserId(user!!.uid);
      } catch (e) {
        console.error("HomeComponent.getLoggedUser: ", e)
      }
    })
  }

  async getListOwner() {
    this.afAuth.authState.subscribe(user => {
      try {
        this.listOwner$ = this.userService.getUserByField(UserFieldsEnum.ID, user!!.uid);
      } catch (e) {
        console.error("HomeComponent.getLoggedUser: ", e)
      }
    })
  }

  timestampToDate(timestamp: string) {
    return DateUtils.timestampToDate(timestamp);
  }

  leave(expensesList: ExpensesList) {
    const modalLeave = this.modalService.open(DialogComponent, { centered: true });
    modalLeave.componentInstance.dialogFields = new DialogFields(
      'Abbandona',
      'Vuoi veramente abbandonare ' + expensesList.name + '?');

    modalLeave.result.then(response => {
      console.log(`Modal response: ${response}`)

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
    })
  }

  delete(expensesList: ExpensesList) {
    const modalDelete = this.modalService.open(DialogComponent, { centered: true });
    modalDelete.componentInstance.dialogFields = new DialogFields(
      'Elimina',
      "Sei l'unico componente di " + expensesList.name + ".\nVuoi veramente cancellarla?");

    modalDelete.result.then((response) => {
      if (!response) {
        return
      }

      this.expensesListService.delete(expensesList.id);
    });
  }
}
