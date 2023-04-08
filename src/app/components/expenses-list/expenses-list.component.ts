import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ExpensesListService } from '../../services/firestore/expensesList/expenses-list.service';
import { ExpensesList } from '../../services/firestore/expensesList/expenses-list';
import { first, Observable } from 'rxjs';
import DateUtils from 'src/app/utils/date-utils';
import { DialogComponent } from 'src/app/components/dialog/confirm-dialog/confirm-dialog.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmDialogFields } from '../dialog/confirm-dialog/confirm-dialog-fields';
import { Router } from '@angular/router';
import { NewListDialogComponent } from '../dialog/new-list-dialog/new-list-dialog.component';
import { ShareDialogComponent } from '../dialog/share-dialog/share-dialog.component';
import { ConstantsService } from 'src/app/services/firestore/constants/constants.service';
import { PathService } from 'src/app/services/path/path.service';
import { UserService } from 'src/app/services/firestore/user/user.service';
import { User } from 'src/app/services/firestore/user/user';
import GenericUtils from 'src/app/utils/generic-utils';

@Component({
  selector: 'app-expenses-list',
  templateUrl: './expenses-list.component.html',
  styleUrls: ['./expenses-list.component.css']
})

export class ExpensesListComponent implements OnInit {

  protected expensesLists$: Observable<ExpensesList[]>;
  protected loggedUser$: Observable<User>;
  public hasLoaded = false;

  constructor(
    public afAuth: AngularFireAuth,
    private expensesListService: ExpensesListService,
    private userService: UserService,
    private modalService: NgbModal,
    private constantsService: ConstantsService,
    public router: Router,
    private pathService: PathService) { }

  ngOnInit(): void {
    if (!this.pathService.isPath("/signin")) {
      this.getExpensesListsByLoggedUser()
    }
  }

  ngOnDestroy() {
    this.modalService.dismissAll()
  }

  private getExpensesListsByLoggedUser() {
    this.afAuth.authState.subscribe(user => {
      try {
        this.loggedUser$ = this.userService.getById(user!!.uid);
        this.loggedUser$.subscribe(user => {
          this.expensesLists$ = this.expensesListService.getByUserId(user);
        })
        
      } catch (e) {
        console.error("ExpensesListComponent.getExpensesListsByLoggedUser: ", e)
      }
    })
  }

  timestampToDateString(timestamp: number) {
    return DateUtils.timestampToDateString(timestamp);
  }

  timestampToHourString(timestamp: number) {
    return DateUtils.timestampToHourString(timestamp);
  }

  leave(expensesList: ExpensesList, user: User) {
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
        this.expensesListService.leave(user.id, expensesList);
      }
    }).catch((res) => { })
  }

  delete(expensesList: ExpensesList) {
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

  newList(userID: string) {
    const modalNewList = this.modalService.open(NewListDialogComponent, { centered: true });

    modalNewList.result.then((response) => {
      if (GenericUtils.isNullOrUndefined(response)) {
        return
      }

      this.expensesListService.insert(response, userID);
    }).catch((res) => { });
  }

  shareLink(listID: string) {
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

  protected changePaidListsVisibility(user: User) {
    const modalConfirm = this.modalService.open(DialogComponent, { centered: true });

    modalConfirm.componentInstance.dialogFields = new ConfirmDialogFields(
      'Conferma',
      user.hidePaidLists
        ? "Vuoi veramente mostrare le liste saldate?"
        : "Vuoi veramente nascondere le liste saldate?"
    );

    modalConfirm.result.then((response) => {
      if (!response) {
        return
      }

      try {
        user.hidePaidLists = !user.hidePaidLists;
        this.userService.update(user)
      } catch (e) {
        console.error("ExpensesListComponent.hidePaidLists: ", e)
      }
    }).catch((res) => { });
  }

  protected archive() {

  }
}
