import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ConfirmDialogFields } from '../dialog/confirm-dialog/confirm-dialog-fields';
import { DialogComponent } from '../dialog/confirm-dialog/confirm-dialog.component';
import { NewListDialogComponent } from '../dialog/new-list-dialog/new-list-dialog.component';
import { ExpensesList } from 'src/app/core/services/postgres/expenses-list/expenses-list';
import { ExpensesListService } from 'src/app/core/services/postgres/expenses-list/expenses-list.service';
import { ExpensesListParticipantService } from 'src/app/core/services/postgres/expenses-list/expenses-list-participant.service';
import { User } from 'src/app/core/services/postgres/user/user';
import { UserService } from 'src/app/core/services/postgres/user/user.service';
import GenericUtils from 'src/app/shared/utils/generic-utils';

@Component({
  selector: 'app-expenses-list',
  templateUrl: './expenses-list.component.html',
  styleUrls: ['./expenses-list.component.css']
})
export class ExpensesListComponent implements OnInit {

  protected allLists: ExpensesList[] = [];
  protected loggedUser: User | null = null;
  protected hasLoaded = false;

  get expensesLists(): ExpensesList[] {
    if (!this.loggedUser?.paid_list_shown) {
      return this.allLists.filter(l => !l.paid);
    }
    return this.allLists;
  }

  constructor(
    private afAuth: AngularFireAuth,
    private pgExpensesListService: ExpensesListService,
    private pgParticipantService: ExpensesListParticipantService,
    private pgUserService: UserService,
    private modalService: NgbModal,
    public router: Router,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  ngOnDestroy() {
    this.modalService.dismissAll();
  }

  private load() {
    this.afAuth.currentUser.then(firebaseUser => {
      if (!firebaseUser?.email) return;
      this.pgUserService.getByEmailWithLists(firebaseUser.email).subscribe({
        next: (res) => {
          this.loggedUser = res.user;
          this.allLists = res.expenses_lists;
          this.hasLoaded = true;
        },
        error: (e) => console.error('ExpensesListComponent.load: ', e)
      });
    });
  }

  private reloadLists() {
    if (!this.loggedUser) return;
    this.pgUserService.getByEmailWithLists(this.loggedUser.email).subscribe({
      next: (res) => this.allLists = res.expenses_lists,
      error: (e) => console.error('ExpensesListComponent.reloadLists: ', e)
    });
  }

  newList(userId: number) {
    const modal = this.modalService.open(NewListDialogComponent, { centered: true });

    modal.result.then((response) => {
      if (GenericUtils.isNullOrUndefined(response)) {
        return;
      }

      this.pgExpensesListService.create({ name: response, user_id: userId, paid: false }).subscribe({
        next: (res) => {
          this.pgParticipantService.add(res.id, userId).subscribe({
            next: () => this.reloadLists(),
            error: (e) => console.error('ExpensesListComponent.newList add participant: ', e)
          });
        },
        error: (e) => console.error('ExpensesListComponent.newList: ', e)
      });
    }).catch(() => {});
  }

  delete(expensesList: ExpensesList) {
    const modal = this.modalService.open(DialogComponent, { centered: true });
    modal.componentInstance.dialogFields = new ConfirmDialogFields(
      'Elimina',
      'Vuoi veramente cancellare ' + expensesList.name + '?'
    );

    modal.result.then((response) => {
      if (!response) {
        return;
      }

      this.pgExpensesListService.delete(expensesList.id).subscribe({
        next: () => this.reloadLists(),
        error: (e) => console.error('ExpensesListComponent.delete: ', e)
      });
    }).catch(() => {});
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('it-IT');
  }

  formatTime(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  }

  protected changePaidListsVisibility() {
    if (!this.loggedUser) return;

    const modal = this.modalService.open(DialogComponent, { centered: true });
    modal.componentInstance.dialogFields = new ConfirmDialogFields(
      'Conferma',
      this.loggedUser.paid_list_shown
        ? 'Vuoi veramente nascondere le liste saldate?'
        : 'Vuoi veramente mostrare le liste saldate?'
    );

    modal.result.then((response) => {
      if (!response || !this.loggedUser) return;

      this.loggedUser.paid_list_shown = !this.loggedUser.paid_list_shown;
      this.pgUserService.update(this.loggedUser.id, { paid_list_shown: this.loggedUser.paid_list_shown }).subscribe({
        next: () => this.reloadLists(),
        error: (e) => console.error('ExpensesListComponent.changePaidListsVisibility: ', e)
      });
    }).catch(() => {});
  }

  protected archive() {}
}
